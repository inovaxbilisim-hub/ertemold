import { NextResponse } from 'next/server';
import { dbAll } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await dbAll<any>(
    `SELECT module, label, description, icon, category, sort_order, active
     FROM config_modules WHERE active = 1 ORDER BY sort_order, label`
  );
  return NextResponse.json({ data: rows });
}
