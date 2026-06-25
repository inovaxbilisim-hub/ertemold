import { NextRequest, NextResponse } from 'next/server';
import { dbGet } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ module: string }> }) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { module: moduleName } = await params;
  const row = await dbGet<any>(
    `SELECT module, label, description, icon, category, sort_order, active, fields
     FROM config_modules WHERE module = $1`,
    [moduleName]
  );

  if (!row) {
    return NextResponse.json({ error: 'Config module not found' }, { status: 404 });
  }

  return NextResponse.json({ data: row });
}
