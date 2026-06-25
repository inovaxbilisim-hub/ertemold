import { revalidatePath, revalidateTag } from 'next/cache';
import { dbAll, dbUpsert, dbDelete } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';
import { ok, unauthorized, badRequest, serverError } from '@/core/api/response';
import { CACHE_TAGS } from '@/core/cache/tags';

async function revalidateServiceCategories() {
  revalidateTag(CACHE_TAGS.SERVICES, 'default');
  revalidateTag(CACHE_TAGS.SITEMAP_DATA, 'default');
  revalidatePath('/');
  revalidatePath('/hizmetler');
}

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const data = await dbAll<Record<string, any>>('SELECT * FROM service_categories ORDER BY sort_order ASC');
    const mapped = data.map(item => ({
      ...item,
      active: Boolean(item.active),
      features: item.features ? (typeof item.features === 'string' ? JSON.parse(item.features) : item.features) : []
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
    const item = await request.json();
    
    const payload: any = {
      slug: item.slug || '',
      name: item.name,
      description: item.description || '',
      icon: item.icon || 'Box',
      sort_order: item.sort_order || 0,
      active: Boolean(item.active),
      features: JSON.stringify(item.features || [])
    };

    if (typeof item.id === 'number') {
      payload.id = item.id;
    }

    await dbUpsert('service_categories', payload, 'id');

    await revalidateServiceCategories();
    
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

  if (!id) return badRequest('Missing id');

  try {
    await dbDelete('service_categories', 'id', parseInt(id));
    await revalidateServiceCategories();
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
