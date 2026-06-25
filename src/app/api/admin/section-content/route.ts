import { revalidatePath, revalidateTag } from 'next/cache';
import { dbAll, dbUpsert, dbDelete } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';
import { ok, unauthorized, badRequest, serverError } from '@/core/api/response';
import { CACHE_TAGS } from '@/core/cache/tags';

async function revalidateSections() {
  revalidateTag(CACHE_TAGS.SETTINGS, 'default');
  revalidatePath('/');
}

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const data = await dbAll<Record<string, any>>('SELECT * FROM section_content ORDER BY section_key ASC');
    const mapped = data.map(item => ({
      ...item,
      id: item.section_key // map section_key to id for useEntities/GenericEntityPage
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
    const { id, section_key, badge, title, subtitle, content } = data;
    
    const keyToUse = section_key || id;
    if (!keyToUse) return badRequest('section_key required');

    const payload = {
      section_key: keyToUse,
      badge,
      title,
      subtitle,
      content
    };

    await dbUpsert('section_content', payload, 'section_key');

    await revalidateSections();
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

  if (!id) return badRequest('ID (section_key) required');

  try {
    await dbDelete('section_content', 'section_key', id);
    await revalidateSections();
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
