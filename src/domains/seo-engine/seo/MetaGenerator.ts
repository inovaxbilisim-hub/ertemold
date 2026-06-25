import type { Metadata } from "next";
import { getSeoByPage, getSettings, getPage } from "@/lib/data";
import { getSiteUrl } from "@/core/utils/host";
import type { SiteSettings } from "@/core/types";
import { replacePlaceholders } from "@/modules/settings/lib/ui-content";
import { HookRegistry } from "@/core/hooks/HookRegistry";

interface SeoParams {
  pageKey?: string;
  title?: string;
  description?: string;
  image?: string;
  descriptionPrefix?: string;
  canonicalPath?: string;
  settings?: SiteSettings | null;
  dynamicContext?: {
    name?: string;
    category?: string;
    location?: string;
  };
}

const MAX_DESCRIPTION_LENGTH = 160;

function normalizeForComparison(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/[|:,\-.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripBrandFromTitle(title: string, siteName: string) {
  const trimmedTitle = title.trim();
  const separators = [" | ", " - ", ": "];

  for (const separator of separators) {
    const [firstPart] = trimmedTitle.split(separator);
    if (!firstPart || !trimmedTitle.includes(separator)) continue;

    if (
      normalizeForComparison(trimmedTitle).includes(
        normalizeForComparison(siteName),
      )
    ) {
      return firstPart.trim();
    }
  }

  return trimmedTitle;
}

function clampDescription(value: string, maxLength = MAX_DESCRIPTION_LENGTH) {
  if (value.length <= maxLength) return value;

  const shortened = value.slice(0, maxLength - 3);
  const safeBreakpoint = shortened.lastIndexOf(" ");
  const base =
    safeBreakpoint > 80 ? shortened.slice(0, safeBreakpoint) : shortened;
  return `${base.trim()}...`;
}

function buildDescription(prefix: string | undefined, description: string) {
  const cleanDescription = description.trim();
  if (!prefix?.trim()) return clampDescription(cleanDescription);

  const cleanPrefix = prefix.trim();
  const normalizedPrefix = normalizeForComparison(cleanPrefix);
  const normalizedDescription = normalizeForComparison(cleanDescription);

  if (normalizedDescription.startsWith(normalizedPrefix))
    return clampDescription(cleanDescription);

  const sentenceBody = cleanDescription.replace(/^[\-:|,.\s]+/, "").trim();
  return clampDescription(`${cleanPrefix} - ${sentenceBody}`);
}

function resolveDescriptionPrefix(
  params: SeoParams,
  titleTemplate: string,
  siteName: string,
) {
  if (params.descriptionPrefix?.trim()) return params.descriptionPrefix.trim();
  if (params.dynamicContext?.name) {
    return `${params.dynamicContext.location ? `${params.dynamicContext.location} ` : ""}${params.dynamicContext.name}`.trim();
  }
  return stripBrandFromTitle(titleTemplate, siteName);
}

function resolveCanonicalPath(params: SeoParams) {
  if (params.canonicalPath) {
    return params.canonicalPath === "/"
      ? "/"
      : `/${params.canonicalPath.replace(/^\/+/, "")}`;
  }
  if (!params.pageKey || params.pageKey === "home") return "/";
  return `/${params.pageKey.replace(/^\/+/, "")}`;
}

function resolveAssetUrl(value: string | undefined, baseUrl: string) {
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  try {
    return new URL(
      value.startsWith("/") ? value : `/${value}`,
      baseUrl,
    ).toString();
  } catch {
    return value;
  }
}

/**
 * MetaGenerator — SEO meta verisi üretici.
 * Mevcut generateMeta mantığını hook entegrasyonu ile domain katmanına taşır.
 * Hook: seo:generate-meta (filter)
 */
export class MetaGenerator {
  static async generate(params: SeoParams = {}): Promise<Metadata> {
    const settings = params.settings ?? (await getSettings());
    const slug =
      params.pageKey === "home"
        ? "/"
        : params.pageKey?.startsWith("/")
          ? params.pageKey
          : `/${params.pageKey || ""}`;

    const dbPage = params.pageKey ? await getPage(slug) : null;
    let pageSeo = params.pageKey ? await getSeoByPage(params.pageKey) : null;

    if (dbPage && (dbPage.meta_title || dbPage.meta_description)) {
      pageSeo = {
        title: (dbPage.meta_title as string) || pageSeo?.title || "",
        description:
          (dbPage.meta_description as string) || pageSeo?.description || "",
        ogImage: pageSeo?.ogImage || "",
      };
    }

    const siteName =
      settings?.companyName || settings?.title || "Web Platformu";
    const siteUrl = await getSiteUrl(settings);

    let finalTitle = params.title;
    let finalDesc = params.description;
    const finalImage = resolveAssetUrl(
      params.image ||
        (pageSeo?.ogImage && pageSeo.ogImage !== "" ? pageSeo.ogImage : null) ||
        (settings?.globalOgImage && settings.globalOgImage !== ""
          ? settings.globalOgImage
          : null) ||
        settings?.brand?.logoPath ||
        undefined,
      siteUrl,
    );

    if (pageSeo) {
      finalTitle = finalTitle || pageSeo.title;
      finalDesc = finalDesc || pageSeo.description;
    }

    if (!finalTitle && params.dynamicContext) {
      const { name, category, location } = params.dynamicContext;
      if (name) {
        finalTitle = `${name}${location ? ` ${location}` : ""} | ${category || settings?.uiContent?.serviceDetail?.approachTitle || "Profesyonel Hizmetler"}`;
      }
    }

    if (!finalDesc && params.dynamicContext) {
      const { name, category, location } = params.dynamicContext;
      if (name) {
        finalDesc = `${location ? `${location} konumunda ` : ""}${name} ${category || "kurumsal hizmetler"} ihtiyaçlarınız için profesyonel çözümler sunuyoruz.`;
      }
    }

    const brandSuffix = ` | ${siteName}`;
    let titleTemplate =
      finalTitle ||
      (params.pageKey
        ? `${params.pageKey.charAt(0).toUpperCase() + params.pageKey.slice(1)}`
        : "");

    if (titleTemplate) {
      if (!titleTemplate.includes(siteName) && !titleTemplate.includes("|")) {
        titleTemplate += brandSuffix;
      }
    } else {
      titleTemplate = siteName;
    }

    const rawDescription =
      finalDesc ||
      settings?.companyDescription ||
      `${siteName} - Profesyonel hizmet sunuyoruz.`;

    const descriptionPrefix = resolveDescriptionPrefix(
      params,
      titleTemplate,
      siteName,
    );
    const sector = settings?.sector || "Kurumsal Hizmetler";
    const finalTitleTemplate = replacePlaceholders(titleTemplate, { sector });
    const finalDescTemplate = replacePlaceholders(
      buildDescription(descriptionPrefix, rawDescription),
      { sector },
    );

    const canonicalPath = resolveCanonicalPath(params);
    const canonicalUrl = new URL(canonicalPath, siteUrl).toString();

    const meta: Metadata = {
      title: finalTitleTemplate,
      description: finalDescTemplate,
      metadataBase: new URL(siteUrl),
      openGraph: {
        title: finalTitleTemplate,
        description: finalDescTemplate,
        images: finalImage ? [finalImage] : [],
        type: "website",
        url: canonicalUrl,
        locale: "tr_TR",
        siteName: siteName,
      },
      twitter: {
        card: "summary_large_image",
        title: finalTitleTemplate,
        description: finalDescTemplate,
        images: finalImage ? [finalImage] : [],
      },
      icons: {
        icon: settings?.brand?.faviconPath || "/favicon.svg",
      },
      alternates: {
        canonical: canonicalUrl,
        languages: {
          tr: canonicalUrl,
          "tr-TR": canonicalUrl,
        },
      },
    };

    // Hook: seo:generate-meta (filter)
    return HookRegistry.applyFiltersAsync("seo:generate-meta", meta, params);
  }
}
