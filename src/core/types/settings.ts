export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

export interface SocialMedia {
  platform: 'facebook' | 'instagram' | 'linkedin' | 'youtube' | string;
  url: string;
  active: boolean;
  order?: number;
}

export interface Branch {
  id: string;
  title: string;
  type: 'merkez' | 'sube';
  address: string;
  city_name?: string;
  city_slug?: string;
  phone: string;
  email: string;
  maps_link: string;
  maps_embed?: string;
  latitude?: number;
  longitude?: number;
  working_hours?: {
    mon_fri?: { opens?: string; closes?: string };
    sat?: { opens?: string; closes?: string };
    sun?: { opens?: string; closes?: string };
  };
  amenities?: string[];
  sort_order: number;
  active: boolean;
  smtp_settings?: {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
    secure?: boolean;
  };
}

// --- UI Content Types ---

interface NavbarUiContent {
  megaMenuBadge: string;
  megaMenuTitle: string;
  megaMenuDescription: string;
  megaMenuCtaText: string;
  megaMenuLoadingText: string;
  mobileAllLabel: string;
}

interface ContactUiContent {
  badge: string;
  title: string;
  subtitle: string;
  namePlaceholder: string;
  phonePlaceholder: string;
  emailPlaceholder: string;
  messagePlaceholder: string;
  submitIdleText: string;
  submitLoadingText: string;
  successTitle: string;
  successDescription: string;
  successResetText: string;
  errorGeneric: string;
  errorForbidden: string;
  errorMissingFields: string;
  phoneLabel: string;
  emailLabel: string;
  hoursLabel: string;
  branchesTitle: string;
  branchCenterBadge: string;
  formTitle: string;
  formSubtitle: string;
  servicePlaceholder: string;
}

export interface HeroUiContent {
  statusBadge: string;
  statusText: string;
  fallbackBadge: string;
  fallbackTitle: string;
  fallbackCtaText: string;
  fallbackSecondaryCtaText: string;
}

interface AdminUiContent {
  loginTitle: string;
  loginSubtitle: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  loginSubmitText: string;
  loginSubmittingText: string;
  loginErrorText: string;
  panelSubtitle: string;
  loadingText: string;
  viewSiteLabel: string;
  logoutLabel: string;
  brandBadge: string;
}

interface ServiceDetailUiContent {
  primaryCtaText: string;
  supportTitle: string;
  supportSubtitle: string;
  approachTitle: string;
  featuresTitle: string;
  trustTitle: string;
  trustDescription: string;
  supportBadge: string;
  servicesBadge: string;
  servicesTitle: string;
  servicesSubtitle: string;
  branchesBadge: string;
  branchesTitle: string;
  branchesSubtitle: string;
  branchesCtaText: string;
  ctaBottomTitle: string;
  ctaBottomSubtitle: string;
  ctaBottomButtonText: string;
  locationsBadge: string;
  locationsTitleSuffix: string;
  locationsDescription: string;
}

interface ServiceLocationUiContent {
  heroBadgeSuffix: string;
  heroTitleSuffix: string;
  heroDescription: string;
  freeDiscoveryCta: string;
  responseTitle: string;
  responseTimeText: string;
  locationServiceTitle: string;
  stats1Label: string;
  stats2Label: string;
  stats3Label: string;
  stats4Label: string;
  localNetworkTitle: string;
  localNetworkBody: string;
  guaranteedInstallTitle: string;
  guaranteedInstallBody: string;
  featuresTitle: string;
  activeSupervisorLabel: string;
  nearbyBadge: string;
  nearbyTitlePrefix: string;
  nearbyDescription: string;
  allRegionsTitle: string;
}

export interface FooterUiContent {
  pagesTitle: string;
  linksTitle: string;
  contactTitle: string;
  missingContactText: string;
  copyrightText: string;
}

interface NotFoundUiContent {
  title: string;
  description: string;
  backLabel: string;
  homeLabel: string;
}

interface ErrorUiContent {
  title: string;
  description: string;
  retryLabel: string;
  homeLabel: string;
}

interface BranchesUiContent {
  heroBadge: string;
  heroTitlePrefix: string;
  heroTitleSuffix: string;
  heroDescription: string;
  centerBadge: string;
  branchBadge: string;
  centerLabel: string;
  branchLabel: string;
  emptyText: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  cardPhoneLabel: string;
  cardEmailLabel: string;
  cardHoursLabel: string;
  cardWeekdayLabel: string;
  cardWeekendLabel: string;
  cardNavLabel: string;
}

interface LegalUiContent {
  badge: string;
}

interface LocationDetailUiContent {
  titlePrefix: string;
  titleSuffix: string;
  subtitle: string;
  servicesTitlePrefix: string;
  servicesTitleSuffix: string;
}

interface ServicesSectionUiContent {
  badge: string;
  title: string;
  subtitle: string;
  viewAllLabel: string;
  detailLabel: string;
}

interface ReferencesSectionUiContent {
  badge: string;
  title: string;
  subtitle: string;
  viewAllLabel: string;
  moreFeaturesSuffix: string;
  generalRefsLabel: string;
  seriesLabel: string;
}

export interface CategoryPageItemUiContent {
  backLabel: string;
  badge: string;
  titlePrefix: string;
  titleAccent: string;
  titleSuffix: string;
  description: string;
  overviewTitle?: string;
  overviewText?: string;
  serviceScopeTitle?: string;
  serviceScopeText?: string;
  processTitle?: string;
  processText?: string;
  referenceSectionTitle?: string;
  referenceSectionSubtitle?: string;
  ctaBottomTitle?: string;
  ctaBottomSubtitle?: string;
  ctaBottomButtonText?: string;
  ctaBottomButtonLink?: string;
}

interface CategoryPagesUiContent {
  [categoryId: string]: CategoryPageItemUiContent;
}

export interface SiteUiContent {
  navbar: NavbarUiContent;
  contact: ContactUiContent;
  hero: HeroUiContent;
  admin: AdminUiContent;
  serviceDetail: ServiceDetailUiContent;
  serviceLocation: ServiceLocationUiContent;
  footer: FooterUiContent;
  notFound: NotFoundUiContent;
  error: ErrorUiContent;
  branches: BranchesUiContent;
  legal: LegalUiContent;
  servicesSection: ServicesSectionUiContent;
  referencesSection: ReferencesSectionUiContent;
  categoryPages: CategoryPagesUiContent;
  locationDetail: LocationDetailUiContent;
  active_theme?: string;
  offerText?: string;
  offerLink?: string;
  checkupWidget: {
    title: string;
    subtitle: string;
    buttonText: string;
    resultTitle?: string;
    resultSubtitle?: string;
    resultFeature1?: string;
    resultFeature2?: string;
    resultFeature3?: string;
    resultCtaText?: string;
    stepsJson?: string;
  };
}

// --- Section Visibility ---

interface ServiceDetailVisibility {
  hero: boolean;
  content: boolean;
  features: boolean;
  trust: boolean;
  locations: boolean;
}

interface ServiceLocationVisibility {
  hero: boolean;
  content: boolean;
  localHighlights: boolean;
  features: boolean;
  nearbyLocations: boolean;
  allRegions: boolean;
}

export interface SiteSectionVisibility {
  serviceDetail: ServiceDetailVisibility;
  serviceLocation: ServiceLocationVisibility;
}

// --- Admin Settings ---

interface AdminBrandSettings {
  panelName: string;
  panelShortName: string;
}

// --- Site Settings ---

export interface SiteSettings {
  id: number;
  title: string;
  siteUrl: string;
  companyName: string;
  sector: string;
  phone: string;
  email: string;
  contactEmail?: string;
  contactEmails?: string[];
  address: string;
  mapsLink: string;
  whatsapp: string;
  showWhatsApp?: boolean;
  codeInjection: {
    gtmId?: string;
    headActive?: boolean;
    headCode?: string;
    bodyStartActive?: boolean;
    bodyStartCode?: string;
    bodyEndActive?: boolean;
    bodyEndCode?: string;
  };
  brand: {
    logoPath: string;
    faviconPath: string;
    footerLogoPath?: string;
    footerLogoMaxWidth?: number;
    footerLogoMaxHeight?: number;
    logoMaxWidth?: number;
    logoMaxHeight?: number;
    shortName?: string;
  };
  announcement: {
    active: boolean;
    text: string;
    link: string;
    bgColor?: string;
    textColor?: string;
    linkText?: string;
    dismissible?: boolean;
  };
  workingHours?: string;
  companyDescription?: string;
  emergencyTitle?: string;
  emergencyDescription?: string;
  formSuccessTitle?: string;
  formSuccessDescription?: string;
  navigation: NavItem[];
  footerLinks: FooterLink[];
  socialMedia: SocialMedia[];
  footerBottomLinks: FooterLink[];
  footerLinkGroups?: FooterLinkGroup[];
  branches?: Branch[];
  uiContent: SiteUiContent;
  sectionVisibility: SiteSectionVisibility;
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
  };
  sitemapChunkSize?: number;
  geoService?: 'none' | 'vercel' | 'ipapi';
  pseo_mode?: 'off' | 'branch_based' | 'country_based';
  pseo_country?: string;
  pseo_location_suffix?: string;
  pseo_action_verb?: string;
  pseo_service_suffix?: string;
  pseo_auto_optimize?: boolean;
  pseo_ai_enabled?: boolean;
  pseo_prompt_template?: string;
  ai_provider?: 'openrouter' | 'gemini';
  openrouter_api_key?: string;
  openrouter_api_keys?: string[];
  gemini_api_key?: string;
  gemini_api_keys?: string[]; // Multiple Gemini keys for rotation/fallback
  ai_model?: string;
  openrouter_ai_model?: string;
  gemini_ai_model?: string;
  ai_prompt_service?: string;
  ai_prompt_service_fields?: string[];
  ai_prompt_category?: string;
  ai_prompt_category_fields?: string[];
  ai_prompt_legal?: string;
  ai_prompt_seo_master?: string;
  ai_prompt_faq?: string;
  ai_prompt_sector_description?: string;
  ai_prompt_sector_json?: string;
  ai_prompt_sector_faq?: string;
  ai_prompt_sector_faq_json?: string;
  ai_sector_faq_min_count?: number;
  ai_faq_min_count?: number;
  ai_bot_enabled?: boolean;
  ai_bot_interval?: number;
  globalOgImage?: string;
  pseo_internal_linking?: boolean;
  pseo_social_proof?: boolean;
  pseo_social_proof_min?: number;
  pseo_social_proof_max?: number;
  pseo_social_proof_text?: string;
  pseo_simulated_stats?: boolean;
  // Content Quality & Threshold Settings
  content_min_projects?: number;        // Minimum projects required to create city page
  content_min_references?: number;      // Minimum references required
  content_require_unique_data?: boolean; // Require unique city data (profile/case study)
  content_redirect_to_main?: boolean;   // Redirect to main service page if threshold not met
  // GEO & Entity Settings
  geo_enabled?: boolean;
  geo_faq_enabled?: boolean;
  geo_org_same_as?: string[];
  geo_know_about?: string;
  geo_publishing_principles?: string;
  geo_founder_name?: string;
  geo_founder_same_as?: string;
  geo_prompt_faq?: string;
  geo_prompt_summary?: string;
  faq_visibility?: string[];
  cloudinary_cloud_name?: string;
  cloudinary_api_key?: string;
  cloudinary_api_secret?: string;
  cloudinary_upload_preset?: string;
  appearance?: string | {
    theme: {
      accentTeal: string;
      accentBlue: string;
      bgPrimary: string;
      bgSecondary: string;
      bgTertiary: string;
      textPrimary: string;
      textSecondary: string;
      textMuted: string;
    };
  };
  active_plugins?: string[];
  plugin_configs?: Record<string, any>;
}
