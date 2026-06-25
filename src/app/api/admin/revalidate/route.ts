import { revalidateTag, revalidatePath } from 'next/cache';
import { verifySession } from '@/core/auth/auth';
import { ok, unauthorized, serverError } from '@/core/api/response';
import { CACHE_TAGS } from '@/core/cache/tags';

export async function POST() {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    // Tüm cache tag'lerini temizle
    Object.values(CACHE_TAGS).forEach((tag) => {
      revalidateTag(tag, 'default');
    });

    // Tüm route'ları yenile
    revalidatePath('/', 'layout');

    return ok({ revalidated: true, at: new Date().toISOString() });
  } catch (error: unknown) {
    console.error('[admin/revalidate] error:', error);
    return serverError(error);
  }
}
