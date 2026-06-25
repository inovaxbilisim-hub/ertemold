/**
 * useSEO — Merkezi SEO meta yönetimi hook'u
 * 
 * Bu hook, sayfa meta verilerini (title, description, OG, canonical) yönetir.
 * Next.js generateMetadata ile entegre çalışır.
 * 
 * @example
 * ```tsx
 * // Server Component'te
 * export const metadata = useSEO({
 *   title: 'Hizmet Adı',
 *   description: 'Hizmet açıklaması',
 *   canonicalPath: '/hizmetler/izmir',
 * });
 * ```
 */

import type { Metadata } from 'next';
import { getSiteUrl } from '@/core/utils/host';
import type { SiteSettings } from '@/core/types';

export interface SEOParams {
  /** Sayfa başlığı */
  title?: string;
  /** Meta description (150-160 karakter önerilir) */
  description?: string;
  /** OG image URL veya path */
  image?: string;
  /** Canonical URL path (/ ile başlamalı) */
  canonicalPath?: string;
  /** Sayfa tipi (home, service, pseo, vb.) */
  pageType?: string;
  /** Ek dinamik context */
  dynamicContext?: {
    name?: string;
    category?: string;
    location?: string;
  };
  /** Site settings (opsiyonel, yoksa DB'den çekilir) */
  settings?: SiteSettings | null;
}

export interface SEOOutput {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
  twitterCard: string;
  locale: string;
  metadata: Metadata;
}

/**
 * SEO parametrelerini normalize eder ve Metadata objesi döner.
 * 
 * @param params - SEO parametreleri
 * @returns Next.js Metadata objesi
 */
export async function useSEO(params: SEOParams): Promise<Metadata> {
  const {
    title,
    description,
    image,
    canonicalPath,
    pageType,
    settings,
  } = params;

  const siteUrl = await getSiteUrl(settings);
  const siteName = settings?.companyName || settings?.title || 'Web Platformu';

  // Canonical URL
  const resolvedCanonical = canonicalPath 
    ? (canonicalPath === '/' ? '/' : `/${canonicalPath.replace(/^\/+/, '')}`)
    : (pageType ? `/${pageType.replace(/^\/+/, '')}` : '/');
  const canonicalUrl = new URL(resolvedCanonical, siteUrl).toString();

  // Title template
  let finalTitle = title || '';
  if (finalTitle && !finalTitle.includes(siteName) && !finalTitle.includes('|')) {
    finalTitle = `${finalTitle} | ${siteName}`;
  }
  if (!finalTitle) {
    finalTitle = siteName;
  }

  // Description
  const maxDescriptionLength = 160;
  let finalDescription = description || settings?.companyDescription || '';
  if (finalDescription.length > maxDescriptionLength) {
    const truncated = finalDescription.slice(0, maxDescriptionLength - 3);
    const breakPoint = truncated.lastIndexOf(' ');
    finalDescription = (breakPoint > 80 ? truncated.slice(0, breakPoint) : truncated).trim() + '...';
  }

  // OG Image
  const resolvedOgImage = image || settings?.globalOgImage || settings?.brand?.logoPath;
  const ogImageUrl = resolvedOgImage 
    ? (resolvedOgImage.startsWith('http') 
        ? resolvedOgImage 
        : new URL(resolvedOgImage.startsWith('/') ? resolvedOgImage : `/${resolvedOgImage}`, siteUrl).toString())
    : undefined;

  return {
    title: finalTitle,
    description: finalDescription,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      images: ogImageUrl ? [{ url: ogImageUrl }] : [],
      type: 'website',
      url: canonicalUrl,
      locale: 'tr_TR',
      siteName: siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
    icons: {
      icon: settings?.brand?.faviconPath || '/favicon.svg',
      apple: '/apple-touch-icon.png',
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        tr: canonicalUrl,
        'tr-TR': canonicalUrl,
      },
    },
  };
}

/**
 * Dinamik sayfa için breadcrumb yapısı oluşturur.
 * 
 * @param crumbs - Breadcrumb parçaları
 * @param siteUrl - Site URL'i
 */
export function buildBreadcrumbFromCrumbs(
  crumbs: Array<{ label: string; href?: string }>,
  siteUrl: string
) {
  return crumbs.map((crumb, index) => ({
    position: index + 1,
    name: crumb.label,
    item: crumb.href 
      ? new URL(crumb.href.startsWith('/') ? crumb.href : `/${crumb.href}`, siteUrl).toString()
      : undefined,
  }));
}