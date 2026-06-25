// Reference domain tip tanımları
// Programmatic Experience SEO - Thin content prevention + Geo + AI Search ready

export interface Reference {
  id: number;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;

  // Location & Service
  city_name: string | null;
  city_slug: string | null;
  service_slug: string | null;
  project_location: string | null;

  // Project details
  project_size: number | null; // m²
  project_date: string | null;
  completion_date: string | null;

  // Technical Details (Migration 012)
  system_type: string | null; // 'epoxy_coating', 'polyurethane', 'self_leveling', etc.
  application_type: string | null; // 'industrial', 'commercial', 'decorative', etc.
  forklift_traffic: string | null; // 'none', 'light', 'medium', 'heavy'
  concrete_type: string | null;
  moisture_problem: boolean;

  // Technical Specifications
  coating_thickness_mm: number | null;
  coverage_rate_sqm_kg: number | null;
  curing_time_hours: number | null;

  // Problem-Solution Story (AI Search optimization)
  challenge: string | null;
  solution: string | null;

  // Media
  featured_image_url: string | null;
  before_image_url: string | null;
  after_image_url: string | null;
  logo_path: string | null;
  primary_video_url: string | null;
  sector: string | null;
  features: string[]; // JSONB parsed

  // Reality Signals
  team_visible: boolean;

  // Status
  featured: boolean;
  published: boolean;
  display_order: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Admin form için dönüştürülmüş format (eski ReferenceForm uyumluluğu)
export interface ReferenceAdmin {
  id: string; // string olarak映射 (admin compat)
  name: string; // title -> name mapping
  slug: string;
  sector: string;
  projectSummary: string; // short_description -> projectSummary
  description: string;
  logoPath: string;
  features: string[];
  active: boolean; // published -> active
  published: boolean;
  featured: boolean;
  featuredImageUrl: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  sort_order: number;
  city_name: string | null;
  city_slug: string | null;
  service_slug: string | null;
  project_size: number | null;
  project_date: string | null;
  completion_date: string | null;
  
  // New fields from Migration 012
  project_location: string | null;
  system_type: string | null;
  application_type: string | null;
  forklift_traffic: string | null;
  concrete_type: string | null;
  moisture_problem: boolean;
  coating_thickness_mm: number | null;
  coverage_rate_sqm_kg: number | null;
  curing_time_hours: number | null;
  challenge: string | null;
  solution: string | null;
  primary_video_url: string | null;
  team_visible: boolean;
}

export interface ReferenceCreateInput {
  name: string;
  slug?: string;
  sector?: string;
  projectSummary?: string;
  description?: string;
  logoPath?: string;
  features?: string[];
  active?: boolean;
  featured?: boolean;
  sort_order?: number;
  featuredImageUrl?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  city_name?: string;
  city_slug?: string;
  service_slug?: string;
  project_size?: number;
  project_date?: string;
  completion_date?: string;
  
  // New fields from Migration 012
  project_location?: string;
  system_type?: string;
  application_type?: string;
  forklift_traffic?: string;
  concrete_type?: string;
  moisture_problem?: boolean;
  coating_thickness_mm?: number;
  coverage_rate_sqm_kg?: number;
  curing_time_hours?: number;
  challenge?: string;
  solution?: string;
  primary_video_url?: string;
  team_visible?: boolean;
}

// Normalized child tables (1:N relationships)
interface ReferenceVideo {
  id: number;
  reference_id: number;
  video_url: string;
  video_type: string | null; // 'youtube', 'vimeo', 'cloudinary'
  title: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  display_order: number;
  created_at: string;
}

interface ReferenceMachinery {
  id: number;
  reference_id: number;
  machine_name: string;
  machine_type: string | null; // 'shot_blasting', 'mixer', 'roller'
  display_order: number;
}

interface ReferenceBrand {
  id: number;
  reference_id: number;
  brand_name: string;
  product_name: string | null;
  product_type: string | null; // 'primer', 'coating', 'sealer'
  display_order: number;
}

interface ReferenceGalleryImage {
  id: number;
  reference_id: number;
  image_url: string;
  image_type: string | null; // 'before', 'during', 'after', 'detail', 'team'
  caption: string | null;
  display_order: number;
  created_at: string;
}