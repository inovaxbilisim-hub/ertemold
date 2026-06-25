import { NextResponse } from 'next/server';
import { dbAll } from '@/core/database/db';
import fs from 'fs';

export async function GET() {
  try {
    const cols = await dbAll('PRAGMA table_info(site_settings)');
    fs.writeFileSync('db_cols.json', JSON.stringify(cols, null, 2));
    return NextResponse.json({ success: true, columns: cols });
  } catch (err: any) {
    try {
        const pgCols = await dbAll(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'site_settings'
        `);
        fs.writeFileSync('db_cols.json', JSON.stringify(pgCols, null, 2));
        return NextResponse.json({ success: true, columns: pgCols });
    } catch(pgErr: any) {
        return NextResponse.json({ success: false, error: err.message, pgError: pgErr.message });
    }
  }
}
