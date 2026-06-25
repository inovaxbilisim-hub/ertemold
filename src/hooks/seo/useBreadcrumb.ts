"use client";

/**
 * useBreadcrumb — Breadcrumb oluşturma hook'u
 * 
 * Mevcut route'dan otomatik breadcrumb array üretir.
 * Hem görsel bileşen hem schema.org verisi döner.
 * 
 * @example
 * ```tsx
 * const { crumbs, schema, BreadcrumbComponent } = useBreadcrumb();
 * 
 * // veya custom crumbs ile
 * const { schema } = useBreadcrumb([
 *   { label: 'Ana Sayfa', href: '/' },
 *   { label: 'Hizmetler', href: '/hizmetler' },
 *   { label: 'İzmir', href: '/hizmetler/izmir' },
 * ]);
 * ```
 */

'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Breadcrumbs from '@/shared/layout/Breadcrumbs';
import type { BreadcrumbSchema } from './useStructuredData';

/**
 * Breadcrumb parçası tipi
 */
export interface Crumb {
  label: string;
  href?: string;
}

/**
 * URL segment'ini Türkçe label'a çevirir
 */
function segmentToLabel(segment: string): string {
  // Önceden tanımlı mapping'ler
  const knownLabels: Record<string, string> = {
    'hizmetler': 'Hizmetler',
    'kurumsal': 'Kurumsal',
    'referanslar': 'Referanslar',
    'iletisim': 'İletişim',
    'sss': 'Sıkça Sorulan Sorular',
    'kvkk': 'KVKK',
    'gizlilik-politikasi': 'Gizlilik Politikası',
    'kullanim-sartlari': 'Kullanım Şartları',
    'aydinlatma-metni': 'Aydınlatma Metni',
    'subelerimiz': 'Şubelerimiz',
    'admin': 'Yönetim Paneli',
    'genel': 'Genel',
    'teknik': 'Teknik',
    'gida': 'Gıda',
    'sanayi': 'Sanayi',
  };

  // Lowercase + slug temizleme
  return knownLabels[segment.toLowerCase()] || normalizeSegment(segment);
}

/**
 * Segment'i okunabilir formata çevirir
 */
function normalizeSegment(segment: string): string {
  // Türkçe karakterleri normalize et
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * URL path'ini breadcrumb array'e çevirir
 */
function pathToCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length === 0) {
    return [];
  }

  const crumbs: Crumb[] = [];
  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    
    // Son segment (mevcut sayfa) href'siz
    const isLast = i === segments.length - 1;
    
    crumbs.push({
      label: segmentToLabel(segment),
      href: isLast ? undefined : currentPath,
    });
  }

  return crumbs;
}

/**
 * Breadcrumb hook'u — URL'den otomatik üretir
 */
export function useBreadcrumb(customCrumbs?: Crumb[]) {
  const pathname = usePathname();

  const crumbs = useMemo(() => {
    if (customCrumbs && customCrumbs.length > 0) {
      return customCrumbs;
    }
    return pathToCrumbs(pathname);
  }, [pathname, customCrumbs]);

  // Schema.org BreadcrumbList
  const schema = useMemo<BreadcrumbSchema>(() => {
    const siteUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://example.com';
    
    // Ana sayfa ekle
    const allCrumbs: Crumb[] = [
      { label: 'Ana Sayfa', href: '/' },
      ...crumbs,
    ];

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: allCrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.label,
        ...(crumb.href && {
          item: new URL(crumb.href, siteUrl).toString(),
        }),
      })),
    };
  }, [crumbs]);

  return {
    crumbs,
    schema,
    BreadcrumbComponent: Breadcrumbs,
  };
}

/**
 * Statik breadcrumb oluştur (server component'ler için)
 */
export function createStaticBreadcrumbs(
  crumbs: Crumb[],
  siteUrl: string
): BreadcrumbSchema {
  const allCrumbs: Crumb[] = [
    { label: 'Ana Sayfa', href: '/' },
    ...crumbs,
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allCrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      ...(crumb.href && {
        item: new URL(crumb.href.startsWith('/') ? crumb.href : `/${crumb.href}`, siteUrl).toString(),
      }),
    })),
  };
}

/**
 * Servis sayfası için breadcrumb oluştur
 */
export function createServiceBreadcrumb(
  serviceName: string,
  serviceSlug: string,
  cityName?: string,
  _citySlug?: string,
  siteUrl?: string
): { crumbs: Crumb[]; schema: BreadcrumbSchema } {
  const base = siteUrl || 'https://example.com';
  
  const crumbs: Crumb[] = [
    { label: serviceName, href: `/hizmetler/${serviceSlug}` },
  ];

  if (cityName) {
    crumbs.push({ label: cityName });
  }

  return {
    crumbs,
    schema: createStaticBreadcrumbs(crumbs, base),
  };
}
