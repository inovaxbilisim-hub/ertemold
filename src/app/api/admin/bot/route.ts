import { NextResponse } from 'next/server';
import { dbGet, dbRun, ensureTableColumn } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';
import { aiBotRunner } from '@/core/bot/AIBot';

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return NextResponse.json({ success: false }, { status: 401 });

  aiBotRunner.init(); // Ensure bot is running even without restart

  await ensureTableColumn('site_settings', 'ai_bot_enabled', 'BOOLEAN DEFAULT FALSE');
  await ensureTableColumn('site_settings', 'ai_bot_interval', 'INTEGER DEFAULT 5');

  const row = await dbGet<{ ai_bot_enabled: unknown; ai_bot_interval: unknown }>(
    'SELECT ai_bot_enabled, ai_bot_interval FROM site_settings LIMIT 1'
  );

  const isRunning = row?.ai_bot_enabled === true || row?.ai_bot_enabled === 1 || row?.ai_bot_enabled === 'true';

  return NextResponse.json({
    success: true,
    data: {
      isRunning,
      intervalMinutes: Number(row?.ai_bot_interval ?? 5),
      lastLog: aiBotRunner.getStatus().lastLog,
    }
  });
}

export async function POST(req: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return NextResponse.json({ success: false }, { status: 401 });

  try {
    await ensureTableColumn('site_settings', 'ai_bot_enabled', 'BOOLEAN DEFAULT FALSE');
    await ensureTableColumn('site_settings', 'ai_bot_interval', 'INTEGER DEFAULT 5');

    const body = await req.json();
    const { action, interval } = body;

    if (action === 'start') {
      const safeInterval = Math.max(1, Number(interval) || 5);
      await dbRun(
        'UPDATE site_settings SET ai_bot_enabled = true, ai_bot_interval = $1 WHERE id = 1',
        [safeInterval]
      );
      aiBotRunner.forceTick(); // Immediately trigger processing
    } else if (action === 'stop') {
      await dbRun('UPDATE site_settings SET ai_bot_enabled = false WHERE id = 1');
    } else if (action === 'update_interval') {
      const safeInterval = Math.max(1, Number(interval) || 5);
      await dbRun('UPDATE site_settings SET ai_bot_interval = $1 WHERE id = 1', [safeInterval]);
    }

    const row = await dbGet<{ ai_bot_enabled: unknown; ai_bot_interval: unknown }>(
      'SELECT ai_bot_enabled, ai_bot_interval FROM site_settings LIMIT 1'
    );
    const isRunning = row?.ai_bot_enabled === true || row?.ai_bot_enabled === 1 || row?.ai_bot_enabled === 'true';

    return NextResponse.json({
      success: true,
      data: {
        isRunning,
        intervalMinutes: Number(row?.ai_bot_interval ?? 5),
        lastLog: aiBotRunner.getStatus().lastLog,
      }
    });
  } catch (err: any) {
    console.error("[BOT API ERROR]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
