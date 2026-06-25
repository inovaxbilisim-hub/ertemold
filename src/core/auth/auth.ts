import { cookies } from 'next/headers';
import { dbRun } from '@/core/database/db';
import { isValidToken } from '@/core/auth/session';

export async function createSession(ip?: string) {
  // Periyodik temizlik: süresi dolmuş oturumları sil (tüm tabloyu asla silme — DoS koruması)
  await dbRun("DELETE FROM admin_sessions WHERE expires_at < NOW()");

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await dbRun(
    'INSERT INTO admin_sessions (token, created_at, expires_at, ip_address) VALUES (?, ?, ?, ?)',
    [token, new Date().toISOString(), expiresAt.toISOString(), ip || 'unknown']
  );

  const cookieStore = await cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return token;
}

export async function verifySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  return isValidToken(token);
}

export async function deleteSession() {
// ...
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (token) {
    await dbRun('DELETE FROM admin_sessions WHERE token = ?', [token]);
  }

  cookieStore.set('admin_token', '', { maxAge: 0, path: '/' });
}
