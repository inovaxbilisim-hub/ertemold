import { NextResponse } from 'next/server';
import { dbAll, dbRun } from '@/core/database/db';
import { getCities } from '@/modules/content/lib/locations';
import { verifySession } from '@/core/auth/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const city_slug = searchParams.get('city_slug');
  const clear = searchParams.get('clear');

  try {
    if (clear === 'true') {
      await dbRun('DELETE FROM location_metadata');
      return NextResponse.json({ success: true, message: 'Table cleared' });
    }

    // 1. Mevcut meta verileri çek
    const metadata = await dbAll('SELECT * FROM location_metadata');
    const metadataMap = new Map(metadata.map((m: any) => [m.city_slug, m]));

    // 2. 81 ili hazırla (DB'den)
    const allCities = (await getCities()).map(c => ({
      city_name: c.name,
      city_slug: c.slug,
    }));

    if (city_slug) {
      const cityData = allCities.find(c => c.city_slug === city_slug);
      const meta = metadataMap.get(city_slug) || {
        city_slug,
        city_name: cityData?.city_name || city_slug.toUpperCase(),
        humidity_group: 'MED',
        max_temp_summer_c: 25,
        min_temp_winter_c: 5,
        osb_list: [],
        industry_profile: {},
        seo_title: '',
        seo_description: '',
        is_active: true
      };
      return NextResponse.json({ success: true, data: meta });
    }

    // 3. Birleştir
    const result = allCities.map(c => {
      const meta = metadataMap.get(c.city_slug);
      return {
        city_slug: c.city_slug,
        city_name: c.city_name,
        humidity_group: meta?.humidity_group || 'MED',
        max_temp_summer_c: meta?.max_temp_summer_c || 25,
        min_temp_winter_c: meta?.min_temp_winter_c || 5,
        is_active: meta ? meta.is_active : true,
        has_custom_data: !!meta
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[pseo/locations] GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const { 
      city_slug, 
      city_name,
      humidity_group, 
      max_temp_summer_c, 
      min_temp_winter_c, 
      osb_list, 
      industry_profile,
      seo_title,
      seo_description,
      is_active
    } = body;

    await dbRun(
      `INSERT INTO location_metadata (
        city_slug, city_name, humidity_group, max_temp_summer_c, min_temp_winter_c, 
        osb_list, industry_profile, seo_title, seo_description, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (city_slug) DO UPDATE SET 
        city_name = EXCLUDED.city_name,
        humidity_group = EXCLUDED.humidity_group, 
        max_temp_summer_c = EXCLUDED.max_temp_summer_c, 
        min_temp_winter_c = EXCLUDED.min_temp_winter_c, 
        osb_list = EXCLUDED.osb_list, 
        industry_profile = EXCLUDED.industry_profile,
        seo_title = EXCLUDED.seo_title,
        seo_description = EXCLUDED.seo_description,
        is_active = EXCLUDED.is_active`,
      [
        city_slug,
        city_name || '',
        humidity_group || 'MED', 
        max_temp_summer_c || 25, 
        min_temp_winter_c || 5, 
        typeof osb_list === 'string' ? osb_list : JSON.stringify(osb_list || []), 
        typeof industry_profile === 'string' ? industry_profile : JSON.stringify(industry_profile || {}),
        seo_title || '',
        seo_description || '',
        is_active ?? true
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[pseo/locations] PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
