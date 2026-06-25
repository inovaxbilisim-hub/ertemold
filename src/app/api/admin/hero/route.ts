import { dbUpsert } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';
import { revalidateTag } from 'next/cache';
import { ok, unauthorized, serverError } from '@/core/api/response';
import { CACHE_TAGS } from '@/core/cache/tags';

async function revalidateHero() {
  revalidateTag(CACHE_TAGS.HERO, 'default');
}

export async function POST(req: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const data = await req.json();
    const { left, gallery, active, galleryLayout, galleryCount } = data;
    
    await dbUpsert('hero_intro', {
      id: 1,
      badge: left.badge || '',
      title: left.title || '',
      description: left.description || '',
      cta_text: left.ctaText || '',
      cta_link: left.ctaLink || '',
      cta_secondary_text: left.ctaSecondaryText || '',
      cta_secondary_link: left.ctaSecondaryLink || '',
      gallery: JSON.stringify(gallery || []),
      active: Boolean(active),
      gallery_layout: galleryLayout !== undefined ? galleryLayout : 'masonry',
      gallery_count: galleryCount !== undefined ? galleryCount : 4
    }, 'id');

    await revalidateHero();
    
    return ok({ success: true });
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function OPTIONS() {
  return ok({ ok: true });
}
