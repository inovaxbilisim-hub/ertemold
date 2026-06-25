import { revalidatePath, revalidateTag } from 'next/cache';
import { dbAll, dbRun } from '@/core/database/db';
import { normalizeSlug } from '@/modules/seo/lib/service-utils';
import { ok, serverError, unauthorized } from '@/core/api/response';
import { CACHE_TAGS } from '@/core/cache/tags';
import { verifySession } from '@/core/auth/auth';

export async function GET() {
  const session = await verifySession();
  if (!session) return unauthorized();
  try {
    const services = await dbAll<any>("SELECT id, title, slug FROM services");
    let fixedCount = 0;

    for (const s of services) {
      if (!s.slug || /^\d+$/.test(s.slug) || s.slug === String(s.id)) {
        const correctSlug = normalizeSlug(s.title);
        await dbRun("UPDATE services SET slug = ? WHERE id = ?", [correctSlug, s.id]);
        fixedCount++;
      }
    }

    if (fixedCount > 0) {
      revalidateTag(CACHE_TAGS.SERVICES, 'default');
      revalidateTag(CACHE_TAGS.SITEMAP_DATA, 'default');
      revalidatePath('/');
    }

    return ok({ 
      success: true, 
      fixedCount, 
      message: `${fixedCount} adet hatalı sayısal slug (bağlantı) düzeltildi ve cache yenilendi.`
    });
  } catch (err: unknown) {
    return serverError(err);
  }
}

export async function OPTIONS() {
  return ok({ ok: true });
}
