import 'server-only';
import { dbGet } from '@/core/database/db';

// In-memory token cache (5s TTL) — eliminates DB round-trip on every admin request
// Düşük TTL: logout sonrası eski token'ın hızlıca geçersiz olmasını sağlar
const tokenCache = new Map<string, { valid: boolean; expiresAt: number }>();
const CACHE_TTL_MS = 5_000;

export async function isValidToken(token: string | undefined) {
  if (!token) return false;

  // Cache hit within TTL
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.valid;
  }

  // Cache miss/expired — query DB
  try {
    const row = await dbGet<{ token: string }>(
      'SELECT token FROM admin_sessions WHERE token = ? AND expires_at > ? LIMIT 1',
      [token, new Date().toISOString()]
    );
    const valid = Boolean(row?.token);
    tokenCache.set(token, { valid, expiresAt: Date.now() + CACHE_TTL_MS });
    return valid;
  } catch (e) {
    console.error("Session validation error:", e);
    return false;
  }
}
