import { revalidateTag } from 'next/cache';
import { dbAll, dbBatch } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';
import { ok, unauthorized, serverError } from '@/core/api/response';
import { CACHE_TAGS } from '@/core/cache/tags';

async function revalidateSeo() {
  revalidateTag(CACHE_TAGS.SEO, 'default');
}

function upsertSeoStmt(pageKey: string, v: { title?: string; description?: string; ogImage?: string }, now: string) {
  const cols = ['page_key', 'title', 'description', 'og_image', 'updated_at'];
  const vals = [pageKey, v.title ?? '', v.description ?? '', v.ogImage ?? '', now];
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  const colNames = cols.map((c) => `"${c}"`).join(', ');
  const updateCols = cols.filter((c) => c !== 'page_key').map((c) => `"${c}" = EXCLUDED."${c}"`).join(', ');
  return {
    sql: `INSERT INTO "seo" (${colNames}) VALUES (${placeholders}) ON CONFLICT ("page_key") DO UPDATE SET ${updateCols}`,
    args: vals,
  };
}

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const data = await dbAll<Record<string, unknown>>('SELECT * FROM seo');

    const obj: Record<string, unknown> = {};
    if (data) {
      data.forEach(s => {
        const pageKey = String(s.page_key);
        obj[pageKey] = {
          title: s.title,
          description: s.description,
          ogImage: s.og_image,
        };
      });
    }
    return ok(obj);
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const data = await request.json();
    const now = new Date().toISOString();

    const stmts = Object.entries(data).map(([key, value]) =>
      upsertSeoStmt(key, value as { title?: string; description?: string; ogImage?: string }, now)
    );
    await dbBatch(stmts);
    await revalidateSeo();
    return ok({ success: true });
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function OPTIONS() {
  return ok({ ok: true });
}
