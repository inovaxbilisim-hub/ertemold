import { getSiteUrl } from "@/core/utils/host";
import type { SiteSettings, Service, Branch, FAQ } from "@/core/types";
import { dbAll, dbGet } from "@/core/database/db";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/core/cache/tags";
import { HookRegistry } from "@/core/hooks/HookRegistry";

async function getAbsoluteUrl(path: string, settings?: SiteSettings | null) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const baseUrl = await getSiteUrl(settings);
  const formattedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(formattedPath, baseUrl).toString();
}

function uniqStrings(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((value) => value.length > 0),
    ),
  );
}

function toSlug(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/\u0131/g, "i")
    .replace(/\u011f/g, "g")
    .replace(/\u00fc/g, "u")
    .replace(/\u015f/g, "s")
    .replace(/\u00f6/g, "o")
    .replace(/\u00e7/g, "c")
    .normalize("NFKD")
    .replace(/[^\w-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getOrganizationName(settings: SiteSettings | null) {
  return settings?.companyName || settings?.title || "Firma";
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, maxLength = 220) {
  if (value.length <= maxLength) return value;
  const shortened = value.slice(0, maxLength - 3);
  const safeBreakpoint = shortened.lastIndexOf(" ");
  const base =
    safeBreakpoint > 120 ? shortened.slice(0, safeBreakpoint) : shortened;
  return `${base.trim()}...`;
}

function getServiceDescription(service: Service) {
  return truncate(
    stripHtml(
      service.seoDescription ||
        service.description ||
        service.longDescription ||
        service.title,
    ),
  );
}

async function buildProvider(settings: SiteSettings | null) {
  return {
    "@type": "Organization",
    name: getOrganizationName(settings),
    url: await getSiteUrl(settings),
    logo: settings?.brand?.logoPath
      ? await getAbsoluteUrl(settings.brand.logoPath, settings)
      : undefined,
    telephone: settings?.phone || undefined,
  };
}

function buildAreaServed(name: string) {
  return { "@type": "AdministrativeArea", name };
}

function buildPostalAddress(
  branch: Branch | undefined,
  settings: SiteSettings | null,
) {
  const streetAddress = branch?.address || settings?.address || "";
  const addressLocality = branch?.city_name || "";
  if (!streetAddress && !addressLocality) return undefined;
  return {
    "@type": "PostalAddress",
    streetAddress: streetAddress || undefined,
    addressLocality: addressLocality || undefined,
    addressCountry: "TR",
  };
}

function buildGeo(branch: Branch | undefined) {
  if (
    typeof branch?.latitude !== "number" ||
    typeof branch?.longitude !== "number"
  )
    return undefined;
  return {
    "@type": "GeoCoordinates",
    latitude: branch.latitude,
    longitude: branch.longitude,
  };
}

const getGoogleReviewsCached = cache(
  unstable_cache(
    async () => {
      try {
        const hasTable = await dbGet<{ exists: boolean }>(
          `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'google_reviews') as "exists"`,
        );
        if (hasTable && hasTable.exists) {
          return (await dbAll(
            `SELECT rating, review_text FROM google_reviews WHERE verified = TRUE ORDER BY review_date DESC LIMIT 10`,
          )) as { rating: number; review_text: string }[];
        }
        return [];
      } catch {
        return [] as { rating: number; review_text: string }[];
      }
    },
    ["v1-google-reviews-schema"],
    { tags: ["reviews"], revalidate: 604800 },
  ),
);

const getActiveSectorNames = cache(
  unstable_cache(
    async () => {
      try {
        const activeSectors = (await dbAll(
          "SELECT name FROM sectors WHERE active = 1",
        )) as { name: string }[];
        return activeSectors
          .map((s) => String(s.name ?? "").trim())
          .filter(Boolean);
      } catch {
        return [] as string[];
      }
    },
    ["v1-active-sectors-schema"],
    {
      tags: [CACHE_TAGS.SECTORS],
      revalidate: 604800,
    },
  ),
);

/**
 * SchemaGenerator — JSON-LD schema üretici.
 * Mevcut schema.ts mantığını hook entegrasyonu ile domain katmanına taşır.
 * Hook: seo:build-schema, seo:build-global-schema (filters)
 */
export class SchemaGenerator {
  static async buildGlobalSchema(settings: SiteSettings | null) {
    if (!settings) return [];

    const providerName = getOrganizationName(settings);
    const mainPhone = settings.phone || undefined;
    const siteUrl = await getSiteUrl(settings);

    const schema: Array<Record<string, unknown>> = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: settings.title || providerName,
        url: siteUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/ara?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ];

    if (settings.geo_enabled !== false) {
      const dbSectors = await getActiveSectorNames();
      const knowsAbout = settings.geo_know_about
        ? settings.geo_know_about
            .split(",")
            .map((s) => s.trim().replace(/\.+$/, ""))
        : settings.sector
          ? [settings.sector]
          : [];

      const mergedSameAs = [
        ...(settings.socialMedia || [])
          .filter((s) => s.active)
          .map((s) => s.url),
        ...(settings.geo_org_same_as || []),
      ];

      schema.push({
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: providerName,
        url: siteUrl,
        logo: settings.brand?.logoPath
          ? await getAbsoluteUrl(settings.brand.logoPath, settings)
          : undefined,
        description:
          settings.companyDescription ||
          settings.geo_prompt_summary ||
          undefined,
        knowsAbout: uniqStrings([...knowsAbout, ...dbSectors]),
        publishingPrinciples: settings.geo_publishing_principles || undefined,
        sameAs: uniqStrings(mergedSameAs),
        contactPoint: {
          "@type": "ContactPoint",
          telephone: mainPhone,
          contactType: "customer service",
          availableLanguage: ["Turkish"],
        },
        address: settings.address
          ? {
              "@type": "PostalAddress",
              streetAddress: settings.address,
              addressCountry: "TR",
            }
          : undefined,
        founder: settings.geo_founder_name
          ? {
              "@type": "Person",
              name: settings.geo_founder_name,
              sameAs: settings.geo_founder_same_as || undefined,
            }
          : undefined,
      });
    }

    // Hook: seo:build-global-schema (filter)
    return HookRegistry.applyFiltersAsync(
      "seo:build-global-schema",
      schema,
      settings,
    );
  }

  static buildHowToSchema(
    name: string,
    description: string,
    features: string[],
  ): Record<string, unknown> {
    if (!features.length) return {};
    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name,
      description,
      step: features.map((feature, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        text: feature,
      })),
    };
  }

  static async buildBreadcrumbSchema(params: {
    crumbs: { label: string; href?: string }[];
    settings: SiteSettings | null;
  }): Promise<Record<string, unknown>> {
    const { crumbs, settings } = params;
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: await Promise.all(
        crumbs.map(async (crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.label,
          item: crumb.href
            ? await getAbsoluteUrl(crumb.href, settings)
            : undefined,
        })),
      ),
    };
  }

  static async buildServiceSchema(params: {
    service: Service;
    settings: SiteSettings | null;
    canonicalPath: string;
    categoryLabel?: string;
  }): Promise<Record<string, unknown>> {
    const { service, settings, canonicalPath, categoryLabel } = params;

    const schema = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.seoTitle || service.title,
      description: getServiceDescription(service),
      serviceType: categoryLabel || service.category,
      category: categoryLabel || service.category,
      provider: await buildProvider(settings),
      areaServed: (settings?.branches || [])
        .filter((branch: Branch) => branch.active && branch.city_name)
        .map((branch: Branch) => buildAreaServed(branch.city_name as string)),
      image: service.imagePath
        ? [await getAbsoluteUrl(service.imagePath, settings)]
        : undefined,
      url: await getAbsoluteUrl(canonicalPath, settings),
    };

    return HookRegistry.applyFiltersAsync("seo:build-schema", schema, {
      type: "service",
      params,
    });
  }

  static async buildLocationServiceSchema(params: {
    service: Service;
    settings: SiteSettings | null;
    branch: Branch | undefined;
    cityName: string;
    citySlug?: string;
    canonicalPath: string;
    categoryLabel?: string;
    metadata?: any;
    faqs?: FAQ[];
  }): Promise<Record<string, unknown>[]> {
    const {
      service,
      settings,
      branch,
      cityName,
      citySlug,
      canonicalPath,
      categoryLabel,
      metadata,
      faqs,
    } = params;

    let osbs: string[] = [];
    try {
      if (Array.isArray(metadata?.osb_list)) {
        osbs = metadata.osb_list;
      } else if (typeof metadata?.osb_list === "string") {
        osbs = JSON.parse(metadata.osb_list);
      }
    } catch {
      osbs = [];
    }

    const localExpertise =
      osbs.length > 0
        ? `${cityName} sanayisindeki ${osbs.slice(0, 2).join(", ")} gibi merkezlerde uzman hizmet sunuyoruz.`
        : "";

    const serviceName = `${cityName} ${service.title}`;
    const providerName = getOrganizationName(settings);
    const mainPhone = settings?.phone || undefined;
    const siteUrl = await getSiteUrl(settings);
    const fallbackBranch =
      branch ||
      (settings?.branches as Branch[] | undefined)?.find(
        (b: Branch) => b.type === "merkez",
      );
    const finalPhone = branch?.phone || mainPhone;
    const workingHours = settings?.workingHours || "09:00-18:00";
    const today = new Date().toISOString().split("T")[0];

    let aggregateRating: any = undefined;
    let reviewsList: any[] = [];
    const realReviews = await getGoogleReviewsCached();
    if (realReviews && realReviews.length > 0) {
      const avgRating = (
        realReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
        realReviews.length
      ).toFixed(1);
      aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: avgRating,
        reviewCount: realReviews.length,
        bestRating: "5",
        worstRating: "1",
      };
      reviewsList = realReviews.slice(0, 3).map((r: any) => ({
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1,
        },
        reviewBody: truncate(r.review_text, 200),
      }));
    }

    const schema: Record<string, unknown>[] = [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: serviceName,
        description: getServiceDescription(service),
        serviceType: categoryLabel || service.category,
        category: categoryLabel || service.category,
        provider: await buildProvider(settings),
        ...(aggregateRating ? { aggregateRating } : {}),
        ...(reviewsList.length > 0 ? { reviews: reviewsList } : {}),
        areaServed: [buildAreaServed(cityName)],
        image: service.imagePath
          ? [await getAbsoluteUrl(service.imagePath, settings)]
          : undefined,
        url: await getAbsoluteUrl(canonicalPath, settings),
        datePublished: "2024-01-01",
        dateModified: today,
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["[data-geo-summary]", "h1", "h2"],
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        name: `${providerName} ${cityName}`,
        description: truncate(
          `${cityName} bolgesinde ${service.title.toLowerCase()} hizmetleri sunuyoruz. ${localExpertise}`,
        ),
        url: await getAbsoluteUrl(canonicalPath, settings),
        telephone: finalPhone,
        image: service.imagePath
          ? [await getAbsoluteUrl(service.imagePath, settings)]
          : undefined,
        areaServed: [buildAreaServed(cityName)],
        address: buildPostalAddress(fallbackBranch, settings),
        geo: buildGeo(fallbackBranch),
        openingHours: workingHours ? `Mo-Su ${workingHours}` : undefined,
        makesOffer: {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service.title,
            serviceType: categoryLabel || service.category,
          },
        },
      },
    ];

    if (settings?.geo_faq_enabled !== false && faqs && faqs.length > 0) {
      schema.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question.replace(/{city}/g, cityName),
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer.replace(/{city}/g, cityName),
          },
        })),
      });
    }

    if (settings?.geo_enabled !== false) {
      const dbSectors = await getActiveSectorNames();
      const knowsAbout = settings?.geo_know_about
        ? settings.geo_know_about
            .split(",")
            .map((s: string) => s.trim().replace(/\.+$/, ""))
        : [service.title, categoryLabel || service.category];
      const mergedSameAs = [
        ...(settings?.socialMedia || [])
          .filter((s: any) => s.active)
          .map((s: any) => s.url),
        ...(settings?.geo_org_same_as || []),
      ];

      schema.push({
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: providerName,
        url: siteUrl,
        logo: settings?.brand?.logoPath
          ? await getAbsoluteUrl(settings.brand.logoPath, settings)
          : undefined,
        description:
          settings?.companyDescription ||
          settings?.geo_prompt_summary ||
          undefined,
        knowsAbout: uniqStrings([
          ...knowsAbout,
          ...dbSectors,
          ...osbs.map((o: string) => `${o} Sanayi Çözümleri`),
          `${cityName} İklimine Uygun Kaplamalar`,
        ]),
        publishingPrinciples: settings?.geo_publishing_principles || undefined,
        sameAs: uniqStrings(mergedSameAs),
        contactPoint: {
          "@type": "ContactPoint",
          telephone: mainPhone,
          contactType: "customer service",
          availableLanguage: ["Turkish"],
        },
        address: settings?.address
          ? {
              "@type": "PostalAddress",
              streetAddress: settings.address,
              addressCountry: "TR",
            }
          : undefined,
        founder: settings?.geo_founder_name
          ? {
              "@type": "Person",
              name: settings.geo_founder_name,
              sameAs: settings.geo_founder_same_as || undefined,
            }
          : undefined,
      });
    }

    schema.push(
      await SchemaGenerator.buildBreadcrumbSchema({
        crumbs: [
          { label: "Ana Sayfa", href: "/" },
          { label: "Hizmetler", href: "/hizmetler" },
          { label: service.title, href: `/hizmetler/${service.slug}` },
          {
            label: cityName,
            href: citySlug
              ? `/hizmetler/${service.slug}/${citySlug}`
              : `/hizmetler/${service.slug}/${toSlug(cityName)}`,
          },
        ],
        settings,
      }),
    );

    return HookRegistry.applyFiltersAsync("seo:build-schema", schema, {
      type: "location_service",
      params,
    });
  }

  static async buildCategoryCollectionSchema(params: {
    name: string;
    description: string;
    canonicalPath: string;
    settings: SiteSettings | null;
    services: Service[];
  }): Promise<Record<string, unknown>> {
    const { name, description, canonicalPath, settings, services } = params;
    const schema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name,
      description: truncate(description),
      url: await getAbsoluteUrl(canonicalPath, settings),
      mainEntity: {
        "@type": "ItemList",
        itemListElement: await Promise.all(
          services.map(async (service, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: await getAbsoluteUrl(`/hizmetler/${service.slug}`, settings),
            name: service.title,
          })),
        ),
      },
      about: {
        "@type": "Service",
        name,
        provider: await buildProvider(settings),
      },
    };
    return HookRegistry.applyFiltersAsync("seo:build-schema", schema, {
      type: "category_collection",
      params,
    });
  }

  static async buildReferencesSchema(params: {
    references: Array<{
      name: string;
      description?: string;
      projectSummary?: string;
      logoPath?: string;
      featuredImageUrl?: string | null;
      city_name?: string | null;
      sector?: string;
      project_size?: number | null;
      project_date?: string | null;
      completion_date?: string | null;
      features?: string[];
    }>;
    settings: SiteSettings | null;
    pageUrl: string;
  }): Promise<Record<string, unknown>[]> {
    const { references, settings, pageUrl } = params;
    const siteUrl = await getSiteUrl(settings);
    const providerName = getOrganizationName(settings);

    const itemListElements = await Promise.all(
      references.map(async (ref, index) => {
        const image =
          ref.featuredImageUrl || ref.logoPath
            ? await getAbsoluteUrl(
                (ref.featuredImageUrl || ref.logoPath)!,
                settings,
              )
            : undefined;

        const item: Record<string, unknown> = {
          "@type": "CreativeWork",
          name: ref.name,
          description: truncate(
            stripHtml(ref.description || ref.projectSummary || ref.name),
          ),
          ...(image ? { image } : {}),
          ...(ref.city_name
            ? {
                locationCreated: {
                  "@type": "Place",
                  name: ref.city_name,
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: ref.city_name,
                    addressCountry: "TR",
                  },
                },
              }
            : {}),
          ...(ref.sector
            ? { about: { "@type": "Thing", name: ref.sector } }
            : {}),
          ...(ref.project_date
            ? { dateCreated: ref.project_date.split("T")[0] }
            : {}),
          ...(ref.completion_date
            ? { datePublished: ref.completion_date.split("T")[0] }
            : {}),
          creator: {
            "@type": "Organization",
            name: providerName,
            url: siteUrl,
          },
        };
        if (ref.project_size) {
          item.additionalProperty = {
            "@type": "PropertyValue",
            name: "Proje Alanı",
            value: `${ref.project_size} m²`,
          };
        }
        return { "@type": "ListItem", position: index + 1, item };
      }),
    );

    const schema = [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${providerName} — Referanslar`,
        description: truncate(
          `${providerName} tarafından tamamlanan projeler ve referanslar.`,
        ),
        url: await getAbsoluteUrl(pageUrl, settings),
        provider: { "@type": "Organization", name: providerName, url: siteUrl },
        mainEntity: {
          "@type": "ItemList",
          name: "Referans Projeleri",
          numberOfItems: references.length,
          itemListElement: itemListElements,
        },
      },
      await SchemaGenerator.buildBreadcrumbSchema({
        crumbs: [
          { label: "Ana Sayfa", href: "/" },
          { label: "Referanslar", href: "/referanslar" },
        ],
        settings,
      }),
    ];

    return HookRegistry.applyFiltersAsync("seo:build-schema", schema, {
      type: "references",
      params,
    });
  }

  /**
   * LocalBusiness schema oluşturur — şubeler için
   */
  static async buildLocalBusinessSchema(params: {
    name: string;
    url: string;
    image?: string;
    telephone?: string;
    streetAddress?: string;
    addressLocality?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    openingHours?: string;
    priceRange?: string;
    areaServed?: string[];
    settings?: SiteSettings | null;
  }): Promise<Record<string, unknown>> {
    const {
      name,
      url,
      image,
      telephone,
      streetAddress,
      addressLocality,
      postalCode,
      latitude,
      longitude,
      openingHours,
      priceRange,
      areaServed,
    } = params;

    const schema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name,
      url,
    };

    if (image) {
      schema.image = image;
    }

    if (telephone) {
      schema.telephone = telephone;
    }

    if (streetAddress || addressLocality) {
      schema.address = {
        "@type": "PostalAddress",
        ...(streetAddress && { streetAddress }),
        ...(addressLocality && { addressLocality }),
        ...(postalCode && { postalCode }),
        addressCountry: "TR",
      };
    }

    if (typeof latitude === "number" && typeof longitude === "number") {
      schema.geo = {
        "@type": "GeoCoordinates",
        latitude,
        longitude,
      };
    }

    if (openingHours) {
      schema.openingHours = openingHours;
    }

    if (priceRange) {
      schema.priceRange = priceRange;
    }

    if (areaServed && areaServed.length > 0) {
      schema.areaServed = areaServed.map((name) => ({
        "@type": "AdministrativeArea",
        name,
      }));
    }

    return schema;
  }

  /**
   * Tüm aktif şubeler için LocalBusiness schema array'i oluşturur
   */
  static async buildAllBranchesSchema(
    settings: SiteSettings | null,
  ): Promise<Record<string, unknown>[]> {
    if (!settings?.branches || settings.branches.length === 0) {
      return [];
    }

    const siteUrl = await getSiteUrl(settings);
    const schemas: Record<string, unknown>[] = [];

    for (const branch of settings.branches) {
      if (!branch.active) continue;

      const branchSchema = await SchemaGenerator.buildLocalBusinessSchema({
        name: branch.title || getOrganizationName(settings),
        url: siteUrl,
        image: settings.brand?.logoPath
          ? await getAbsoluteUrl(settings.brand.logoPath, settings)
          : undefined,
        telephone: branch.phone || settings.phone,
        streetAddress: branch.address,
        addressLocality: branch.city_name || undefined,
        postalCode: undefined, // branch type does not have postal_code currently
        latitude:
          typeof branch.latitude === "number" ? branch.latitude : undefined,
        longitude:
          typeof branch.longitude === "number" ? branch.longitude : undefined,
        openingHours: settings.workingHours || undefined,
        priceRange: "$$",
        areaServed: branch.city_name ? [branch.city_name] : undefined,
        settings,
      });

      schemas.push(branchSchema);
    }

    return schemas;
  }
}
