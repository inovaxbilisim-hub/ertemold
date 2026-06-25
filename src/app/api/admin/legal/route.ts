import { revalidateTag } from 'next/cache';
import { dbAll, dbBatch } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';
import { ok, unauthorized, serverError } from '@/core/api/response';
import { CACHE_TAGS } from '@/core/cache/tags';

async function revalidateLegal() {
  revalidateTag(CACHE_TAGS.LEGAL, 'default');
}

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const data = await dbAll<Record<string, unknown>>('SELECT id, title, meta_title, meta_description, content, last_updated, published FROM legal_pages');

    const obj: Record<string, any> = {};
    data.forEach((l) => {
      const id = String(l.id);
      obj[id] = {
        title: l.title,
        metaTitle: l.meta_title,
        metaDescription: l.meta_description,
        content: l.content ?? '',
        lastUpdated: String(l.last_updated ?? new Date().toISOString()),
        published: Boolean(l.published ?? true),
      };
    });
    return ok(obj);
  } catch (error: unknown) {
    return serverError(error);
  }
}

function upsertLegalStmt(key: string, v: any, now: string) {
  const cols = ['id', 'title', 'meta_title', 'meta_description', 'content', 'last_updated', 'published'];
  const vals = [key, v.title, v.metaTitle, v.metaDescription, v.content, now, v.published ? 1 : 0];
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  const colNames = cols.map((c) => `"${c}"`).join(', ');
  const updateCols = cols.filter((c) => c !== 'id').map((c) => `"${c}" = EXCLUDED."${c}"`).join(', ');
  return {
    sql: `INSERT INTO "legal_pages" (${colNames}) VALUES (${placeholders}) ON CONFLICT ("id") DO UPDATE SET ${updateCols}`,
    args: vals,
  };
}

export async function POST(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const data = await request.json();
    const now = new Date().toISOString();

    const stmts = Object.entries(data).map(([key, val]) => upsertLegalStmt(key, val, now));
    await dbBatch(stmts);
    await revalidateLegal();
    return ok({ success: true });
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function OPTIONS() {
  return ok({ ok: true });
}
