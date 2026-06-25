import { revalidatePath, revalidateTag } from 'next/cache';
import { dbAll, dbUpsert, dbDelete, dbInsert } from '@/core/database/db';
import { randomUUID } from 'crypto';
import { verifySession } from '@/core/auth/auth';
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

export async function POST(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    const payload = {
      id: id && id !== 'new' ? id : randomUUID(),
      title: updateData.title,
      type: updateData.type,
      address: updateData.address,
      city_name: updateData.city_name,
      city_slug: updateData.city_slug,
      phone: updateData.phone,
      email: updateData.email,
      maps_link: updateData.maps_link,
      maps_embed: updateData.maps_embed,
      working_hours: JSON.stringify(updateData.working_hours || {}),
      amenities: JSON.stringify(updateData.amenities || []),
      sort_order: updateData.sort_order || 0,
      active: Boolean(updateData.active),
      smtp_settings: JSON.stringify(updateData.smtp_settings || {}),
    };

    if (id && id !== 'new') {
      await dbUpsert('business_branches', payload, 'id');
    } else {
      await dbInsert('business_branches', payload);
    }

    await revalidateLocationSurfaces();
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

  if (!id) return badRequest('ID required');

  try {
    await dbDelete('business_branches', 'id', id);
    await revalidateLocationSurfaces();
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
