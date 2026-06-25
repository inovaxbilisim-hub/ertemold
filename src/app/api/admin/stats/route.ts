import { revalidateTag } from 'next/cache';
import { dbAll, dbBatch } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';
import { ok, unauthorized, badRequest, serverError } from '@/core/api/response';
import { CACHE_TAGS } from '@/core/cache/tags';

async function revalidateStats() {
  revalidateTag(CACHE_TAGS.STATS, 'default');
}

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const data = await dbAll<Record<string, unknown>>(
      'SELECT * FROM stats ORDER BY sort_order ASC'
    );

    const mapped = data.map((s: any) => ({ ...s, order: s.sort_order }));
    return ok(mapped);
  } catch (error: unknown) {
    return serverError(error);
  }
}

function deleteStmt(table: string, idCol: string, idVal: string | number) {
  const sql = `DELETE FROM "${table}" WHERE "${idCol}" = $1`;
  return { sql, args: [idVal] };
}

function upsertStatsStmt(s: any) {
  const cols = ['id', 'label', 'value', 'sort_order'];
  const vals = [s.id, s.label, s.value, s.order ?? s.sort_order ?? 0];
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  const colNames = cols.map((c) => `"${c}"`).join(', ');
  const updateCols = cols.filter((c) => c !== 'id').map((c) => `"${c}" = EXCLUDED."${c}"`).join(', ');
  return {
    sql: `INSERT INTO "stats" (${colNames}) VALUES (${placeholders}) ON CONFLICT ("id") DO UPDATE SET ${updateCols}`,
    args: vals,
  };
}

export async function POST(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const data = await request.json();
    if (!Array.isArray(data)) return badRequest('Data must be an array');
    
    const submittedIds = new Set(data.map((s: any) => String(s.id)));

    // Silinecek kayıtları bul
    const existingStats = await dbAll<{ id: string }>('SELECT id FROM stats');
    const toDelete = existingStats.filter(e => !submittedIds.has(String(e.id)));

    // Batch: delete + upsert
    const stmts: { sql: string; args?: unknown[] }[] = [
      ...toDelete.map((e) => deleteStmt('stats', 'id', e.id)),
      ...data.map((s) => upsertStatsStmt(s)),
    ];
    await dbBatch(stmts);
    await revalidateStats();

    return ok({ success: true });
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function OPTIONS() {
  return ok({ ok: true });
}
