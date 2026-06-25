export interface ThicknessPrice {
  label: string;
  price: number;
}

export interface ExtraService {
  label: string;
  price: number;
}

export interface ServiceCalculatorConfig {
  service_slug: string;
  title: string;
  thickness_prices: ThicknessPrice[];
  extra_services: ExtraService[];
}

export type CalculatorPlacement = 
  | 'all' 
  | 'service_only' 
  | 'location_only' 
  | 'calculator_page_only' 
  | 'cta_only' 
  | 'none';
export type CalculatorPageType = 'service' | 'pseo' | 'calculator-page';

export interface CalculatorPluginConfig {
  render_on_service_pages?: boolean;
  currency?: string;
  placement?: CalculatorPlacement;
  button_text?: string;
  result_title?: string;
  result_description?: string;
  result_cta_text?: string;
  minimum_area?: number;
  extra_services?: { label: string; value: string | number }[];
  disclaimer?: string;
  enabled_services?: string[];
  service_configs?: {
    service_slug: string;
    title: string;
    thickness_prices: { label: string; value: string | number }[];
    extra_services: { label: string; value: string | number }[];
  }[];
  seo_enable_m2_price_page?: boolean;
  seo_content_mode?: string;
  seo_page_title_template?: string;
  seo_page_description_template?: string;
  seo_page_body_template?: string;
  seo_thin_content_warning?: string;
  cta_button_text?: string;
  cta_button_icon?: 'Calculator' | 'ArrowRight' | 'DollarSign' | 'none';
}
