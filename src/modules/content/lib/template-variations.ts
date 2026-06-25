/**
 * Template Variations
 *
 * Phase 3 - B4: Content differentiation based on dominant industry sector
 *
 * Determines the dominant sector for a city, then selects appropriate:
 * - Hero title variations
 * - CTA text variations
 * - Content emphasis (technical angle)
 * - Section badge labels
 *
 * Uses ONLY real data from the database.
 */

import 'server-only';
import { dbAll } from '@/core/database/db';

export type IndustrySector =
  | 'automotive'
  | 'food'
  | 'logistics'
  | 'textile'
  | 'chemical'
  | 'pharma'
  | 'electronics'
  | 'construction'
  | 'default';

export interface TemplateVariation {
  sector: IndustrySector;
  sectorLabel: string;

  // Hero content
  heroBadge: string;
  heroTitleSuffix: string;
  heroDescription: string;

  // CTA
  primaryCta: string;
  secondaryCta: string;

  // Technical emphasis
  technicalAngle: string;
  keyBenefit: string;

  // Content badge
  contentBadge: string;
}

const VARIATIONS: Record<IndustrySector, Omit<TemplateVariation, 'sector'>> = {
  automotive: {
    sectorLabel: 'Otomotiv',
    heroBadge: 'OTOMOTİV SEKTÖRü',
    heroTitleSuffix: 'Ağır Yük ve Forklift Trafiğine Dayanıklı',
    heroDescription: 'Otomotiv tesislerinde forklift trafiği, yağ ve kimyasal darbelerine karşı yüksek performanslı zemin sistemleri uyguluyoruz.',
    primaryCta: 'Saha İncelemesi Talep Et',
    secondaryCta: 'Teknik Şartname İndir',
    technicalAngle: 'Forklift dayanımı ve kimyasal direnç',
    keyBenefit: 'Yüksek trafik yoğunluğu ve ağır yük taşıma',
    contentBadge: 'OTOMOTİV STANDARTLARI',
  },
  food: {
    sectorLabel: 'Gıda',
    heroBadge: 'GIDA SEKTÖRü',
    heroTitleSuffix: 'Hijyenik ve FDA Uyumlu Zemin Çözümleri',
    heroDescription: 'Gıda üretim tesislerinde hijyen standartlarını karşılayan, kolay temizlenebilir ve kaymaz epoksi zemin sistemleri sunuyoruz.',
    primaryCta: 'Hijyen Sertifikası İste',
    secondaryCta: 'FDA Uyumluluk Rehberi',
    technicalAngle: 'Hijyen standartları ve kolay temizlik',
    keyBenefit: 'Gıda güvenliği ve dezenfeksiyon direnci',
    contentBadge: 'GIDA HİJYENİ STANDARTLARI',
  },
  logistics: {
    sectorLabel: 'Lojistik & Depo',
    heroBadge: 'LOJİSTİK SEKTÖRü',
    heroTitleSuffix: 'Yüksek Trafik Yoğunluğu için Dayanıklı Zemin',
    heroDescription: 'Depo ve lojistik merkezlerinde yoğun araç trafiğini, şok yüklerini ve sürekli kullanımı kaldıran güçlendirilmiş epoksi zeminler.',
    primaryCta: 'Depo Zemin Analizi İste',
    secondaryCta: 'Trafik Yoğunluğu Hesapla',
    technicalAngle: 'Sürekli yük ve yüksek trafik',
    keyBenefit: 'Kesintisiz operasyon ve uzun ömürlü zemin',
    contentBadge: 'LOJİSTİK ÇÖZÜMLER',
  },
  textile: {
    sectorLabel: 'Tekstil',
    heroBadge: 'TEKSTİL SEKTÖRü',
    heroTitleSuffix: 'Toz Kontrolü ve Antistatik Zemin Sistemleri',
    heroDescription: 'Tekstil üretiminde toz kontrolü, statik elektrik yönetimi ve kolay bakım sağlayan özel epoksi zemin formülasyonları uyguluyoruz.',
    primaryCta: 'Antistatik Zemin Analizi',
    secondaryCta: 'Toz Kontrol Çözümleri',
    technicalAngle: 'Antistatik koruma ve toz kontrolü',
    keyBenefit: 'Ürün kalitesi ve makine koruma',
    contentBadge: 'TEKSTİL STANDARTLARI',
  },
  chemical: {
    sectorLabel: 'Kimya',
    heroBadge: 'KİMYA SEKTÖRü',
    heroTitleSuffix: 'Kimyasal Dayanımlı Epoksi Zemin Sistemleri',
    heroDescription: 'Kimyasal tesislerde asit, baz ve solvent dirençli özel kaplama sistemleri ile zemin güvenliğini en üst düzeye taşıyoruz.',
    primaryCta: 'Kimyasal Direnç Testi İste',
    secondaryCta: 'Malzeme Güvenlik Belgesi',
    technicalAngle: 'Kimyasal direnç ve sızdırmazlık',
    keyBenefit: 'Çevre güvenliği ve zemin ömrü',
    contentBadge: 'KİMYASAL DİRENÇ',
  },
  pharma: {
    sectorLabel: 'İlaç & Sağlık',
    heroBadge: 'İLAÇ SEKTÖRü',
    heroTitleSuffix: 'GMP Uyumlu Hijyenik Zemin Çözümleri',
    heroDescription: 'İlaç üretim tesisleri için GMP standartlarına uygun, pürüzsüz, derzsiz ve tam hijyenik epoksi zemin sistemleri.',
    primaryCta: 'GMP Validasyon Desteği',
    secondaryCta: 'İlaç Sektörü Referansları',
    technicalAngle: 'GMP uyumluluğu ve steril yüzeyler',
    keyBenefit: 'Regülasyon uyumu ve çapraz kontaminasyon önleme',
    contentBadge: 'GMP STANDARTLARI',
  },
  electronics: {
    sectorLabel: 'Elektronik',
    heroBadge: 'ELEKTRONİK SEKTÖRü',
    heroTitleSuffix: 'ESD Korumalı Antistatik Zemin Sistemleri',
    heroDescription: 'Elektronik üretim ve montaj tesislerinde ESD (Elektrostatik Boşalma) koruması sağlayan özel antistatik epoksi zeminler.',
    primaryCta: 'ESD Zemin Ölçümü İste',
    secondaryCta: 'IEC 61340 Uyumluluk',
    technicalAngle: 'ESD koruması ve elektrostatik kontrol',
    keyBenefit: 'Elektronik bileşen güvenliği',
    contentBadge: 'ESD STANDARTLARI',
  },
  construction: {
    sectorLabel: 'İnşaat',
    heroBadge: 'İNŞAAT SEKTÖRü',
    heroTitleSuffix: 'Yüksek Performanslı Endüstriyel Zemin Kaplama',
    heroDescription: 'İnşaat ve yapı sektöründe uzun ömürlü, sağlam ve estetik görünümlü epoksi zemin kaplama sistemleri.',
    primaryCta: 'Proje Metraj Hesapla',
    secondaryCta: 'Teknik Katalog',
    technicalAngle: 'Dayanıklılık ve uzun ömür',
    keyBenefit: 'Bina değeri ve estetik kalite',
    contentBadge: 'İNŞAAT ÇÖZÜMLER',
  },
  default: {
    sectorLabel: 'Endüstriyel',
    heroBadge: 'ENDÜSTRİYEL ÇÖZÜMLER',
    heroTitleSuffix: 'Profesyonel Epoksi Zemin Kaplama',
    heroDescription: 'Endüstriyel ve ticari alanlarda uzman ekibimizle yüksek kaliteli epoksi zemin kaplama çözümleri sunuyoruz.',
    primaryCta: 'Ücretsiz Keşif',
    secondaryCta: 'Teklif Al',
    technicalAngle: 'Kalite ve dayanıklılık',
    keyBenefit: 'Uzun ömürlü ve güvenilir zemin',
    contentBadge: 'HİZMET BİLGİSİ',
  },
};

/**
 * Determine dominant sector for a city from reference data
 */
export async function getDominantSector(citySlug: string): Promise<IndustrySector> {
  try {
    const rows = await dbAll<{ sector: string; count: number }>(
      `SELECT sector, COUNT(*) as count
       FROM "references"
       WHERE city_slug = $1 AND published = TRUE AND sector IS NOT NULL AND sector != ''
       GROUP BY sector
       ORDER BY count DESC
       LIMIT 1`,
      [citySlug]
    );

    if (rows.length === 0) return 'default';

    const topSector = rows[0].sector.toLowerCase();

    if (topSector.includes('otomotiv') || topSector.includes('automotive')) return 'automotive';
    if (topSector.includes('gıda') || topSector.includes('food')) return 'food';
    if (topSector.includes('lojistik') || topSector.includes('depo')) return 'logistics';
    if (topSector.includes('tekstil') || topSector.includes('textile')) return 'textile';
    if (topSector.includes('kimya') || topSector.includes('chemical')) return 'chemical';
    if (topSector.includes('ilaç') || topSector.includes('pharma') || topSector.includes('sağlık')) return 'pharma';
    if (topSector.includes('elektronik') || topSector.includes('electro')) return 'electronics';
    if (topSector.includes('inşaat') || topSector.includes('yapı') || topSector.includes('construction')) return 'construction';

    return 'default';
  } catch (err) {
    console.error('[TEMPLATE-VARIATION] getDominantSector error:', err);
    return 'default';
  }
}

/**
 * Get the full template variation for a city
 */
export function getTemplateVariation(sector: IndustrySector): TemplateVariation {
  return {
    sector,
    ...VARIATIONS[sector],
  };
}

/**
 * Combine city name + service + variation into final hero text
 */
export function buildVariationText(
  variation: TemplateVariation,
  cityName: string,
  serviceTitle: string
): {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  primaryCta: string;
  secondaryCta: string;
  contentBadge: string;
  keyBenefit: string;
} {
  // Only customize if it's not default (meaning we have real sector data)
  if (variation.sector === 'default') {
    return {
      heroBadge: `${cityName.toUpperCase()} HİZMETLERİ`,
      heroTitle: `${cityName} ${serviceTitle}`,
      heroDescription: variation.heroDescription,
      primaryCta: variation.primaryCta,
      secondaryCta: variation.secondaryCta,
      contentBadge: variation.contentBadge,
      keyBenefit: variation.keyBenefit,
    };
  }

  return {
    heroBadge: `${cityName.toUpperCase()} ${variation.heroBadge}`,
    heroTitle: `${cityName}'da ${variation.sectorLabel} Sektörüne Özel ${serviceTitle}`,
    heroDescription: variation.heroDescription,
    primaryCta: variation.primaryCta,
    secondaryCta: variation.secondaryCta,
    contentBadge: variation.contentBadge,
    keyBenefit: variation.keyBenefit,
  };
}
