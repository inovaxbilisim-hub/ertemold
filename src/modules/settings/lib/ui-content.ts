import { SiteSectionVisibility, SiteUiContent } from '@/core/types';


export const defaultUiContent: SiteUiContent = {
  navbar: {
    megaMenuBadge: '',
    megaMenuTitle: '',
    megaMenuDescription: '',
    megaMenuCtaText: '',
    megaMenuLoadingText: '',
    mobileAllLabel: '',
  },
  contact: {
    badge: 'PROFESYONEL DESTEK HATTI',
    title: 'EKİBİMİZLE & İLETİŞİME GEÇİN.',
    subtitle: 'Hizmetlerimizle ilgili tüm sorularınız için uzman danışmanlarımız size yardımcı olmaya hazır.',
    phoneLabel: 'BİZE ULAŞIN',
    emailLabel: 'E-POSTA ADRESİMİZ',
    hoursLabel: 'ÇALIŞMA SAATLERİ',
    branchesTitle: 'ŞUBELERİMİZ',
    branchCenterBadge: 'MERKEZ',
    successTitle: 'TEŞEKKÜRLER!',
    successDescription: 'Mesajınız başarıyla iletildi. En kısa sürede sizinle iletişime geçeceğiz.',
    successResetText: 'YENİ MESAJ GÖNDER',
    formTitle: 'İLETİŞİM FORMU',
    formSubtitle: 'Size nasıl yardımcı olabiliriz? Formu doldurun, sizi arayalım.',
    servicePlaceholder: 'HİZMET SEÇİNİZ',
    submitIdleText: 'MESAJI GÖNDER',
    submitLoadingText: 'GÖNDERİLİYOR...',
    namePlaceholder: 'ADINIZ SOYADINIZ',
    phonePlaceholder: 'TELEFON NUMARANIZ',
    emailPlaceholder: 'E-POSTA ADRESİNİZ',
    messagePlaceholder: 'MESAJINIZ',
    errorGeneric: 'Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.',
    errorForbidden: 'Sadece Türkiye içinden başvuru kabul edilmektedir.',
    errorMissingFields: 'Lütfen tüm yıldızlı alanları doldurun.',
  },
  hero: {
    statusBadge: '',
    statusText: '',
    fallbackBadge: '',
    fallbackTitle: '',
    fallbackCtaText: '',
    fallbackSecondaryCtaText: '',
  },
  admin: {
    loginTitle: '',
    loginSubtitle: '',
    usernameLabel: '',
    usernamePlaceholder: '',
    passwordLabel: '',
    passwordPlaceholder: '',
    loginSubmitText: '',
    loginSubmittingText: '',
    loginErrorText: '',
    panelSubtitle: '',
    loadingText: '',
    viewSiteLabel: '',
    logoutLabel: '',
    brandBadge: '',
  },
  serviceDetail: {
    primaryCtaText: '',
    supportTitle: '',
    supportSubtitle: '',
    approachTitle: '',
    featuresTitle: '',
    trustTitle: '',
    trustDescription: '',
    locationsBadge: '',
    locationsTitleSuffix: '',
    locationsDescription: '',
    supportBadge: '',
    servicesBadge: '',
    servicesTitle: '',
    servicesSubtitle: '',
    branchesBadge: '',
    branchesTitle: '',
    branchesSubtitle: '',
    branchesCtaText: '',
    ctaBottomTitle: '',
    ctaBottomSubtitle: '',
    ctaBottomButtonText: '',
  },
  serviceLocation: {
    heroBadgeSuffix: '',
    heroTitleSuffix: '',
    heroDescription: '',
    freeDiscoveryCta: '',
    responseTitle: '',
    responseTimeText: '',
    locationServiceTitle: '',
    stats1Label: '',
    stats2Label: '',
    stats3Label: '',
    stats4Label: '',
    localNetworkTitle: '',
    localNetworkBody: '',
    guaranteedInstallTitle: '',
    guaranteedInstallBody: '',
    featuresTitle: '',
    activeSupervisorLabel: '',
    nearbyBadge: '',
    nearbyTitlePrefix: '',
    nearbyDescription: '',
    allRegionsTitle: '',
  },
  footer: {
    pagesTitle: '',
    linksTitle: '',
    contactTitle: '',
    missingContactText: '',
    copyrightText: '',
  },
  notFound: {
    title: '',
    description: '',
    backLabel: '',
    homeLabel: '',
  },
  error: {
    title: '',
    description: '',
    retryLabel: '',
    homeLabel: '',
  },
  branches: {
    heroBadge: '',
    heroTitlePrefix: '',
    heroTitleSuffix: '',
    heroDescription: '',
    centerBadge: '',
    branchBadge: '',
    centerLabel: '',
    branchLabel: '',
    emptyText: '',
    ctaTitle: '',
    ctaDescription: '',
    ctaButtonText: '',
    cardPhoneLabel: '',
    cardEmailLabel: '',
    cardHoursLabel: '',
    cardWeekdayLabel: '',
    cardWeekendLabel: '',
    cardNavLabel: '',
  },
  legal: {
    badge: '',
  },
  servicesSection: {
    badge: '',
    title: '',
    subtitle: '',
    viewAllLabel: '',
    detailLabel: '',
  },
  referencesSection: {
    badge: '',
    title: '',
    subtitle: '',
    viewAllLabel: '',
    moreFeaturesSuffix: '',
    generalRefsLabel: '',
    seriesLabel: '',
  },
  categoryPages: {
    genel_cozumler: {
      backLabel: '',
      badge: '',
      titlePrefix: '',
      titleAccent: '',
      titleSuffix: '',
      description: '',
      overviewTitle: '',
      overviewText: '',
      serviceScopeTitle: '',
      serviceScopeText: '',
      processTitle: '',
      processText: '',
      referenceSectionTitle: '',
      referenceSectionSubtitle: '',
      ctaBottomTitle: '',
      ctaBottomSubtitle: '',
      ctaBottomButtonText: '',
      ctaBottomButtonLink: '',
    },
    zemin_kaplama: {
      backLabel: '',
      badge: '',
      titlePrefix: '',
      titleAccent: '',
      titleSuffix: '',
      description: '',
      overviewTitle: '',
      overviewText: '',
      serviceScopeTitle: '',
      serviceScopeText: '',
      processTitle: '',
      processText: '',
      referenceSectionTitle: '',
      referenceSectionSubtitle: '',
      ctaBottomTitle: '',
      ctaBottomSubtitle: '',
      ctaBottomButtonText: '',
      ctaBottomButtonLink: '',
    },
    uygulama: {
      backLabel: '',
      badge: '',
      titlePrefix: '',
      titleAccent: '',
      titleSuffix: '',
      description: '',
      overviewTitle: '',
      overviewText: '',
      serviceScopeTitle: '',
      serviceScopeText: '',
      processTitle: '',
      processText: '',
      referenceSectionTitle: '',
      referenceSectionSubtitle: '',
      ctaBottomTitle: '',
      ctaBottomSubtitle: '',
      ctaBottomButtonText: '',
      ctaBottomButtonLink: '',
    },
  },
  locationDetail: {
    titlePrefix: '',
    titleSuffix: '',
    subtitle: '',
    servicesTitlePrefix: '',
    servicesTitleSuffix: '',
  },
  offerText: '',
  offerLink: '',
  checkupWidget: {
    title: '',
    subtitle: '',
    buttonText: '',
    resultTitle: '',
    resultSubtitle: '',
    resultFeature1: '',
    resultFeature2: '',
    resultFeature3: '',
    resultCtaText: '',
    stepsJson: '',
  },
};

export const defaultSectionVisibility: SiteSectionVisibility = {
  serviceDetail: {
    hero: true,
    content: true,
    features: true,
    trust: true,
    locations: true,
  },
  serviceLocation: {
    hero: true,
    content: true,
    localHighlights: true,
    features: true,
    nearbyLocations: true,
    allRegions: true,
  },
};

export function formatUiText(template: string | undefined, values: Record<string, string | number>) {
  if (!template) {
    return '';
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
}

export function replacePlaceholders(obj: any, values: Record<string, string>): any {
  if (typeof obj === 'string') {
    return formatUiText(obj, values);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => replacePlaceholders(item, values));
  }
  if (typeof obj === 'object' && obj !== null) {
    const result: any = {};
    for (const key in obj) {
      result[key] = replacePlaceholders(obj[key], values);
    }
    return result;
  }
  return obj;
}

export function mergeUiContent(value: Partial<SiteUiContent> | null | undefined, sector?: string): SiteUiContent {
  const result = { ...defaultUiContent };
  const sectorName = sector || 'Kurumsal Hizmetler';
  
  if (!value) {
    return replacePlaceholders(result, { sector: sectorName });
  }

  // Compatibility Layer: Map old keys to new keys if they exist in the incoming value
  const compatibilityMap: Record<string, string> = {
    // serviceLocation mappings
    technicalServiceTitle: 'locationServiceTitle',
    statsSupportLabel: 'stats1Label',
    statsExperienceLabel: 'stats2Label',
    statsRatingLabel: 'stats3Label',
    statsReferenceLabel: 'stats4Label',
    // serviceDetail mappings
  };

  (Object.keys(result) as Array<keyof SiteUiContent>).forEach((key) => {
    if (key === 'active_theme') return;
    
    const incomingValue = value[key];
    const defaultValue = result[key];

    if (incomingValue !== undefined) {
      if (defaultValue && typeof defaultValue === 'object' && !Array.isArray(defaultValue)) {
        const mergedSection = { ...defaultValue } as any;
        const incomingSection = incomingValue as any;
        
        // Merge known keys
        Object.keys(mergedSection).forEach(subKey => {
          if (incomingSection[subKey] !== undefined) {
            mergedSection[subKey] = incomingSection[subKey];
          }
        });

        // Check compatibility map
        Object.entries(compatibilityMap).forEach(([oldKey, newKey]) => {
          if (incomingSection[oldKey] !== undefined && mergedSection[newKey] === (defaultUiContent as any)[key][newKey]) {
            mergedSection[newKey] = incomingSection[oldKey];
          }
        });

        (result as any)[key] = mergedSection;
      } else {
        // Direct value assignment for strings/primitives
        (result as any)[key] = incomingValue;
      }
    }
  });

  if (value.active_theme) {
    result.active_theme = value.active_theme;
  } else {
    result.active_theme = 'default';
  }

  return replacePlaceholders(result, { sector: sectorName });
}

export function mergeSectionVisibility(value: Partial<SiteSectionVisibility> | null | undefined): SiteSectionVisibility {
  const result = { ...defaultSectionVisibility };
  if (!value) return result;

  (Object.keys(result) as Array<keyof SiteSectionVisibility>).forEach((key) => {
    if (value[key]) {
      result[key] = {
        ...result[key],
        ...value[key],
      } as any;
    }
  });

  return result;
}
