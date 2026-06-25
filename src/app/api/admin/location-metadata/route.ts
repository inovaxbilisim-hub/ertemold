import { revalidatePath, revalidateTag } from 'next/cache';
import { dbAll, dbUpsert, dbDelete } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';
import { ok, unauthorized, badRequest, serverError } from '@/core/api/response';
import { CACHE_TAGS } from '@/core/cache/tags';

async function revalidateLocations() {
  revalidateTag(CACHE_TAGS.LOCATIONS, 'default');
  revalidateTag(CACHE_TAGS.SITEMAP_DATA, 'default');
  revalidatePath('/');
}

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const data = await dbAll<Record<string, any>>('SELECT * FROM location_metadata ORDER BY city_name ASC');
    const mapped = data.map(item => ({
      ...item,
      id: item.city_slug, // map city_slug to id for useEntities/GenericEntityPage
      is_active: Boolean(item.is_active)
    }));
    return ok(mapped);
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const data = await request.json();
    const { 
      id, city_slug, city_name, humidity_group, 
      max_temp_summer_c, min_temp_winter_c, 
      seo_title, seo_description, is_active 
    } = data;
    
    const keyToUse = city_slug || id;
    if (!keyToUse) return badRequest('city_slug required');

    const payload = {
      city_slug: keyToUse,
      city_name,
      humidity_group: humidity_group || 'MED',
      max_temp_summer_c: max_temp_summer_c ? Number(max_temp_summer_c) : 25,
      min_temp_winter_c: min_temp_winter_c ? Number(min_temp_winter_c) : 5,
      seo_title,
      seo_description,
      is_active: Boolean(is_active !== false)
    };

    await dbUpsert('location_metadata', payload, 'city_slug');

    await revalidateLocations();
    return ok({ success: true });
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function DELETE(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return badRequest('ID (city_slug) required');

  try {
    await dbDelete('location_metadata', 'city_slug', id);
    await revalidateLocations();
    return ok({ success: true });
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function PUT(request: Request) {
  return POST(request);
}

export async function OPTIONS() {
  return ok({ ok: true });
}
