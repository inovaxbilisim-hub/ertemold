import crypto from 'node:crypto';
import { dbExec, dbInsert } from '@/core/database/db';

interface TrackingRequestLike {
  headers: Headers;
}

interface PhoneClickPayload {
  phone: string;
  path?: string;
  source?: string;
  branchId?: string;
  branchTitle?: string;
  cityName?: string;
  citySlug?: string;
}

function buildSessionId(request: TrackingRequestLike) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0]?.trim() || realIp || '127.0.0.1';
  const salt = process.env.ANALYTICS_SALT || 'digiperf-analytics-2026';
  // IP + salt + client timestamp hash ile unique session (KVKK uyumlu)
  const clientTs = request.headers.get('x-client-ts') || Date.now().toString();
  return crypto.createHash('sha256').update(ip + salt + clientTs).digest('hex').slice(0, 16);
}

let analyticsTablesInitialized = false;

export async function ensureAnalyticsTables() {
  if (analyticsTablesInitialized) return;
  // DDL'ler (CREATE TABLE/INDEX) permission hatası verebilir (42501).
  // Tablolar zaten varsa sorun yok — index'ler de opsiyonel.
  for (const ddl of [
    `CREATE TABLE IF NOT EXISTS page_views (
      id TEXT PRIMARY KEY,
      path TEXT,
      session_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS phone_click_events (
      id TEXT PRIMARY KEY,
      branch_id TEXT,
      branch_title TEXT,
      city_name TEXT,
      city_slug TEXT,
      phone TEXT NOT NULL,
      path TEXT,
      source TEXT,
      session_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    'CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id)',
    'CREATE INDEX IF NOT EXISTS idx_phone_click_events_created_at ON phone_click_events(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_phone_click_events_branch_id ON phone_click_events(branch_id)',
  ]) {
    try {
      await dbExec(ddl);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('42501') && !message.toLowerCase().includes('sahibi') && !message.toLowerCase().includes('permission denied')) {
        throw error;
      }
      // Permission hatası → tablo/index zaten var, atla
    }
  }
  analyticsTablesInitialized = true;
}

export async function trackPageView(request: TrackingRequestLike, path: string) {
  await ensureAnalyticsTables();

  await dbInsert('page_views', {
    id: crypto.randomUUID(),
    path: path || '/',
    session_id: buildSessionId(request),
  });
}

export async function trackPhoneClick(request: TrackingRequestLike, payload: PhoneClickPayload) {
  await ensureAnalyticsTables();

  await dbInsert('phone_click_events', {
    id: crypto.randomUUID(),
    branch_id: payload.branchId || '',
    branch_title: payload.branchTitle || '',
    city_name: payload.cityName || '',
    city_slug: payload.citySlug || '',
    phone: payload.phone,
    path: payload.path || '/',
    source: payload.source || '',
    session_id: buildSessionId(request),
  });
}
