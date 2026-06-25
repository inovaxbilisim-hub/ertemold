import { revalidateTag, revalidatePath } from 'next/cache';
import { verifySession } from '@/core/auth/auth';
import { ok, unauthorized, badRequest, serverError } from '@/core/api/response';
import { CACHE_TAGS } from '@/core/cache/tags';
import { getAllReferences, upsertReference, deleteReference } from '@/domains/content/reference';

async function revalidateRefs() {
  revalidateTag(CACHE_TAGS.REFERENCES, 'default');
  revalidateTag(CACHE_TAGS.SITEMAP_DATA, 'default');
  revalidatePath('/referanslar');
}

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();
  try {
    const refs = await getAllReferences();
    return ok(refs);
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();
  try {
    const data = await request.json();
    const items = Array.isArray(data) ? data : [data];
    for (const item of items) {
      await upsertReference(item);
    }
    await revalidateRefs();
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
    await deleteReference(Number(id));
    await revalidateRefs();
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