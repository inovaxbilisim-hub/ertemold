import { revalidatePath, revalidateTag } from 'next/cache';
import { dbAll, dbGet, dbRun, dbUpsert } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';
import { ok, unauthorized, badRequest, serverError } from '@/core/api/response';
import { CACHE_TAGS } from '@/core/cache/tags';

export const dynamic = 'force-dynamic';

async function revalidatePages(slug?: string) {
  revalidateTag(CACHE_TAGS.PAGES, 'default');
  revalidateTag(CACHE_TAGS.SITEMAP_DATA, 'default');
  if (slug) {
    revalidatePath(slug);
  }
}

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const pages = await dbAll<Record<string, unknown>>(
      'SELECT * FROM pages ORDER BY updated_at DESC'
    );

    // Parse JSON data
    const parsedPages = pages.map(page => ({
      ...page,
      is_published: Boolean(page.is_published),
      content_data: typeof page.content_data === 'string' ? JSON.parse(page.content_data) : page.content_data || {},
    }));

    return ok(parsedPages);
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const body = await request.json();
    const { id, slug, title, template_name, meta_title, meta_description, content_data, is_published } = body;

    const pageId = id || `page_${Date.now()}`;
    
    // Check if slug exists
    const existing = await dbAll<any>('SELECT id FROM pages WHERE slug = ? AND id != ?', [slug, pageId]);
    if (existing.length > 0) {
      return badRequest('Bu URL bağlantısı (slug) başka bir sayfa tarafından kullanılıyor.');
    }

    await dbUpsert('pages', {
      id: pageId,
      slug,
      title,
      template_name: template_name || 'default',
      meta_title: meta_title || '',
      meta_description: meta_description || '',
      content_data: JSON.stringify(content_data || {}),
      is_published: Boolean(is_published),
      updated_at: new Date().toISOString()
    }, 'id');

    await revalidatePages(slug);
    return ok({ success: true });
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function DELETE(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get('id');

  if (!idParam) return badRequest('ID required');

  try {
    const page = await dbGet<{ slug: string }>('SELECT slug FROM pages WHERE id = ?', [idParam]);
    await dbRun('DELETE FROM pages WHERE id = ?', [idParam]);
    await revalidatePages(page?.slug);
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
