import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/data';
import { mergeUiContent } from '@/modules/settings/lib/ui-content';

export async function GET() {
  try {
    const data = await getSettings();
    if (!data) return NextResponse.json({ error: 'Settings not found' }, { status: 404 });

    return NextResponse.json({
      companyName: data.companyName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      mapsLink: data.mapsLink,
      whatsapp: data.whatsapp,
      showWhatsApp: data.showWhatsApp,
      brand: data.brand,
      announcement: data.announcement,
      navigation: data.navigation,
      footerLinks: data.footerLinks,
      footerBottomLinks: data.footerBottomLinks,
      socialMedia: data.socialMedia,
      codeInjection: data.codeInjection,
      uiContent: mergeUiContent(data.uiContent),
      workingHours: data.workingHours,
      companyDescription: data.companyDescription,
      sectionVisibility: data.sectionVisibility,
      pseo_mode: data.pseo_mode,
      pseo_country: data.pseo_country,
      pseo_location_suffix: data.pseo_location_suffix,
      pseo_action_verb: data.pseo_action_verb,
      pseo_service_suffix: data.pseo_service_suffix,
      pseo_auto_optimize: data.pseo_auto_optimize,
      pseo_ai_enabled: data.pseo_ai_enabled,
      pseo_internal_linking: data.pseo_internal_linking,
      pseo_social_proof: data.pseo_social_proof,
      pseo_social_proof_min: data.pseo_social_proof_min,
      pseo_social_proof_max: data.pseo_social_proof_max,
      pseo_social_proof_text: data.pseo_social_proof_text,
      ai_provider: data.ai_provider,
      ai_model: data.ai_model,
      geoService: data.geoService,
      cloudinary_cloud_name: data.cloudinary_cloud_name,
      cloudinary_api_key: data.cloudinary_api_key,
      cloudinary_upload_preset: data.cloudinary_upload_preset,
      sitemapChunkSize: data.sitemapChunkSize,
      faq_visibility: data.faq_visibility || [],
      active_plugins: data.active_plugins || [],
      plugin_configs: data.plugin_configs || {},
    });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
