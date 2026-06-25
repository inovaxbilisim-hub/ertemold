import { revalidateTag } from 'next/cache';
import { dbAll, dbBatch, dbDelete } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';
import { ok, unauthorized, badRequest, serverError } from '@/core/api/response';
import { CACHE_TAGS } from '@/core/cache/tags';

async function revalidateFaqs() {
  revalidateTag(CACHE_TAGS.FAQS, 'default');
}

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const data = await dbAll<any>(
      'SELECT * FROM faqs ORDER BY sort_order ASC'
    );

    const mapped = data.map((f: any) => ({
      ...f,
      active: Boolean(f.active),
      display_pages: f.display_pages ? (typeof f.display_pages === 'string' ? JSON.parse(f.display_pages) : f.display_pages) : [],
    }));
    return ok(mapped);
  } catch (error: unknown) {
    return serverError(error);
  }
}

function upsertFaqStmt(f: any) {
  const cols = ['id', 'question', 'answer', 'category', 'sort_order', 'active', 'display_pages', 'updated_at'];
  const vals = [
    f.id || crypto.randomUUID(),
    f.question || '',
    f.answer || '',
    f.category || '',
    Number(f.sort_order || 0),
    f.active ? 1 : 0,
    Array.isArray(f.display_pages) ? JSON.stringify(f.display_pages) : '[]',
    new Date().toISOString(),
  ];
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  const colNames = cols.map((c) => `"${c}"`).join(', ');
  const updateCols = cols.filter((c) => c !== 'id').map((c) => `"${c}" = EXCLUDED."${c}"`).join(', ');
  return {
    sql: `INSERT INTO "faqs" (${colNames}) VALUES (${placeholders}) ON CONFLICT ("id") DO UPDATE SET ${updateCols}`,
    args: vals,
  };
}

export async function POST(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const data = await request.json();
    const items = Array.isArray(data) ? data : [data];

    const stmts = items.map((f: any) => upsertFaqStmt(f));
    await dbBatch(stmts);

    await revalidateFaqs();
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
    await dbDelete('faqs', 'id', id);
    await revalidateFaqs();
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
