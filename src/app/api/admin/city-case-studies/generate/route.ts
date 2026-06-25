/**
 * Admin API: Generate City Case Studies
 *
 * POST /api/admin/city-case-studies/generate
 * Body: { citySlug, cityName, serviceSlug, serviceTitle }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateCityCaseStudies,
  saveCaseStudies,
  getCityCaseStudies,
} from '@/modules/ai/lib/city-case-studies';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { citySlug, cityName, serviceSlug, serviceTitle } = body;

    if (!citySlug || !cityName || !serviceSlug || !serviceTitle) {
      return NextResponse.json(
        { error: 'citySlug, cityName, serviceSlug and serviceTitle are required' },
        { status: 400 }
      );
    }

    console.log(`[API] Generating case studies: ${citySlug}/${serviceSlug}`);

    const caseStudies = await generateCityCaseStudies(
      citySlug,
      cityName,
      serviceSlug,
      serviceTitle,
      2  // max 2 case studies per city+service
    );

    if (caseStudies.length === 0) {
      return NextResponse.json(
        { error: 'No eligible references found for this city/service combination' },
        { status: 404 }
      );
    }

    await saveCaseStudies(caseStudies);

    return NextResponse.json({
      success: true,
      count: caseStudies.length,
      caseStudies: caseStudies.map(cs => ({
        id: cs.id,
        projectTitle: cs.projectTitle,
        storyTitle: cs.storyTitle,
        sector: cs.sector,
        projectSize: cs.projectSize,
      })),
    });
  } catch (error) {
    console.error('[API] Case study generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate case studies', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const citySlug = searchParams.get('citySlug');
  const serviceSlug = searchParams.get('serviceSlug');

  if (!citySlug || !serviceSlug) {
    return NextResponse.json({ error: 'citySlug and serviceSlug required' }, { status: 400 });
  }

  try {
    const caseStudies = await getCityCaseStudies(citySlug, serviceSlug);
    return NextResponse.json({ success: true, caseStudies });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch case studies' }, { status: 500 });
  }
}
