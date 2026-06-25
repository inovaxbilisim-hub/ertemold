/**
 * Admin API: Generate City Industry Profile
 * 
 * POST /api/admin/city-profiles/generate
 * Body: { citySlug: string, serviceSlug?: string }
 * 
 * Generates AI-powered industry analysis and caches it in database
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCityIndustryProfile } from '@/modules/ai/lib/city-industry-profile';
import { dbRun } from '@/core/database/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { citySlug, serviceSlug, serviceTitle } = body;

    if (!citySlug) {
      return NextResponse.json(
        { error: 'citySlug is required' },
        { status: 400 }
      );
    }

    console.log(`[API] Generating city profile: ${citySlug}, service: ${serviceSlug || 'global'}`);

    // Generate profile
    const profile = await generateCityIndustryProfile(citySlug, serviceTitle || 'Epoksi Zemin');

    if (!profile) {
      return NextResponse.json(
        { error: 'Could not generate profile - insufficient data or city not found' },
        { status: 404 }
      );
    }

    // Save to database
    await dbRun(
      `INSERT INTO city_industry_profiles 
        (city_slug, city_name, service_slug, dominant_sectors, typical_needs, 
         recommended_systems, local_challenges, heavy_traffic, chemical_resistance, 
         hygiene, dust_control, analysis_text)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT(city_slug, service_slug) 
       DO UPDATE SET
         city_name = $2,
         dominant_sectors = $4,
         typical_needs = $5,
         recommended_systems = $6,
         local_challenges = $7,
         heavy_traffic = $8,
         chemical_resistance = $9,
         hygiene = $10,
         dust_control = $11,
         analysis_text = $12,
         updated_at = CURRENT_TIMESTAMP`,
      [
        profile.citySlug,
        profile.cityName,
        serviceSlug || null,
        JSON.stringify(profile.dominantSectors),
        JSON.stringify(profile.typicalNeeds),
        JSON.stringify(profile.recommendedSystems),
        JSON.stringify(profile.localChallenges),
        profile.floorRequirements.heavyTraffic ? 1 : 0,
        profile.floorRequirements.chemicalResistance ? 1 : 0,
        profile.floorRequirements.hygiene ? 1 : 0,
        profile.floorRequirements.dustControl ? 1 : 0,
        profile.analysisText
      ]
    );

    console.log(`[API] City profile saved successfully for ${citySlug}`);

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        generatedAt: profile.generatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('[API] City profile generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate city profile',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/city-profiles/generate?citySlug=ankara&serviceSlug=self-leveling
 * Fetch existing profile or return 404
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const citySlug = searchParams.get('citySlug');

    if (!citySlug) {
      return NextResponse.json(
        { error: 'citySlug parameter required' },
        { status: 400 }
      );
    }

    const { getCityIndustryProfile } = await import('@/modules/content/lib/data-services');
    const serviceSlug = searchParams.get('serviceSlug') || undefined;
    
    const profile = await getCityIndustryProfile(citySlug, serviceSlug);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, profile });

  } catch (error) {
    console.error('[API] Get city profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
