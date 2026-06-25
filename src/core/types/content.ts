export interface TimelineStage {
  day: number;
  title: string;
  description: string;
  icon: string;
}

export interface ServiceCategory {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  active: boolean;
  features?: string[];
}

export interface Service {
  id: number;
  slug: string;
  category_id: number;
  category?: string;
  title: string;
  description: string;
  longDescription: string;
  imagePath: string;
  icon?: string;
  iconColor?: string;
  iconBgColor?: string;
  features: string[];
  color: string;
  seoTitle?: string;
  seoDescription?: string;
  pseo_h2_template?: string;
  pseo_action_verb?: string;
  pseo_service_suffix?: string;
  calculator_enabled?: boolean;
  calculator_price_per_sqm?: number | null;
  calculator_description?: string;
  calculator_button_text?: string;
  calculator_disclaimer?: string;
  active: boolean;
  sortOrder: number;
  timeline_stages?: TimelineStage[] | null;
  compatible_sectors?: string[] | null;
  serviceFaqs?: FAQ[] | null;
}

export interface Reference {
  id?: string;
  slug?: string;
  name: string;
  sector: string;
  sector_id?: string;
  projectSummary: string;
  description: string;
  logoPath: string;
  features?: string[];
  active: boolean;
  published?: boolean;
  featured?: boolean;
  displayOrder?: number;
  featuredImageUrl?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  city_name?: string | null;
  city_slug?: string | null;
  service_slug?: string | null;
  project_size?: number | null;
  project_date?: string | null;
  completion_date?: string | null;

  project_location?: string | null;
  system_type?: string | null;
  application_type?: string | null;
  forklift_traffic?: string | null;
  concrete_type?: string | null;
  moisture_problem?: boolean;
  coating_thickness_mm?: number | null;
  coverage_rate_sqm_kg?: number | null;
  curing_time_hours?: number | null;
  challenge?: string | null;
  solution?: string | null;
  primary_video_url?: string | null;
  team_visible?: boolean;
}

export interface Stat {
  id?: string;
  label: string;
  value: string;
  order: number;
}

export interface SectionContent {
  sectionKey: string;
  badge: string;
  title: string;
  subtitle: string;
  content: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  template_name: string;
  meta_title?: string;
  meta_description?: string;
  content_data: Record<string, any>;
  is_published: boolean;
}

export interface LegalPage {
  title: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  lastUpdated: string;
  published: boolean;
}

export interface HeroData {
  id?: number;
  active: boolean;
  left: {
    badge: string;
    title: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    ctaSecondaryText: string;
    ctaSecondaryLink: string;
  };
  videoUrl?: string;
  backgroundImage?: string;
  galleryLayout?: "masonry" | "grid";
  galleryCount?: number;
  gallery: {
    id?: number;
    path: string;
    alt: string;
    size: "small" | "large";
  }[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  category?: string;
  active: boolean;
  display_pages?: string[];
}

export interface Sector {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon?: string;
  sort_order: number;
  active: boolean;
  features?: string[];
  image_path?: string;
  ui_metadata?: string;
  recommended_service_ids?: number[];
}
