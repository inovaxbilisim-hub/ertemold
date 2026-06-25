import { revalidatePath, revalidateTag } from 'next/cache';
import { dbAll, dbDelete, dbUpsert } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';
import { randomUUID } from 'crypto';
import { ok, unauthorized, badRequest, serverError } from '@/core/api/response';
import { CACHE_TAGS } from '@/core/cache/tags';

async function revalidateLocationSurfaces() {
  revalidateTag(CACHE_TAGS.LOCATIONS, 'default');
  revalidateTag(CACHE_TAGS.BRANCHES, 'default');
  revalidateTag(CACHE_TAGS.SETTINGS, 'default');
  revalidatePath('/');
  revalidatePath('/hizmetler');
  revalidatePath('/kurumsal/subelerimiz');
}

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const data = await dbAll<Record<string, unknown>>(
      'SELECT * FROM business_branches ORDER BY sort_order ASC'
    );

    // Parse JSON columns
    const parsed = data.map(branch => ({
      ...branch,
      active: Boolean(branch.active),
      working_hours: typeof branch.working_hours === 'string' ? JSON.parse(branch.working_hours) : (branch.working_hours || {}),
      amenities: typeof branch.amenities === 'string' ? JSON.parse(branch.amenities) : (branch.amenities || []),
      smtp_settings: typeof branch.smtp_settings === 'string' ? JSON.parse(branch.smtp_settings) : (branch.smtp_settings || {}),
    }));

    return ok(parsed);
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function POST(req: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const data = await req.json();
    
    const payload = {
      id: data.id || randomUUID(),
      title: String(data.title || ''),
      type: data.type || 'sube',
      city_name: String(data.city_name || ''),
      city_slug: String(data.city_slug || ''),
      address: String(data.address || ''),
      phone: String(data.phone || ''),
      email: String(data.email || ''),
      maps_link: String(data.maps_link || ''),
      maps_embed: data.maps_embed ? String(data.maps_embed) : null,
      smtp_settings: JSON.stringify(data.smtp_settings || {}),
      working_hours: JSON.stringify(data.working_hours || {}),
      amenities: JSON.stringify(data.amenities || []),
      active: Boolean(data.active),
      sort_order: Number(data.sort_order || 0),
    };

    await dbUpsert('business_branches', payload, 'id');
    
    await revalidateLocationSurfaces();
    return ok({ success: true });
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function PUT(req: Request) {
  return POST(req);
}

export async function DELETE(req: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return badRequest('ID required');

  try {
    await dbDelete('business_branches', 'id', id);
    await revalidateLocationSurfaces();
    return ok({ success: true });
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function OPTIONS() {
  return ok({ ok: true });
}
