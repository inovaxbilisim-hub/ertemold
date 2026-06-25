import { ok, unauthorized, serverError, methodNotAllowed, tooManyRequests } from '@/core/api/response';
import { createSession } from '@/core/auth/auth';
import { verifyPassword, hashPassword } from '@/core/auth/password';
import { auditLog } from '@/core/security/audit';
import { dbGet, dbRun } from '@/core/database/db';

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const ADMIN_PASSWORD_FALLBACK = process.env.ADMIN_PASSWORD;

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export async function GET() {
  return methodNotAllowed();
}

async function ensureAdminUser() {
  const existing = await dbGet<{ id: number }>('SELECT id FROM admin_users LIMIT 1');
  if (existing) return;

  const username = process.env.ADMIN_USERNAME || 'adminde';
  const password = ADMIN_PASSWORD_FALLBACK || 'admin1234';
  const hash = ADMIN_PASSWORD_HASH || await hashPassword(password);

  await dbRun(
    'INSERT INTO admin_users (username, password_hash) VALUES (?, ?) ON CONFLICT (username) DO NOTHING',
    [username, hash]
  );
}

export async function POST(request: Request) {
  try {
    await ensureAdminUser();
  } catch {
    // Tablo henüz yoksa env auth'a devam et
  }

  if (!ADMIN_PASSWORD_HASH && !ADMIN_PASSWORD_FALLBACK) {
    const dbUser = await dbGet<{ password_hash: string }>('SELECT password_hash FROM admin_users LIMIT 1');
    if (!dbUser) {
      return serverError('Server misconfigured: No authentication method available.');
    }
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (attempt && attempt.count >= 5 && now < attempt.resetAt) {
    const remaining = Math.ceil((attempt.resetAt - now) / 60000);
    return tooManyRequests(`Çok fazla deneme yapıldı. Lütfen ${remaining} dakika sonra tekrar deneyin.`);
  }

  try {
    const { username, password } = await request.json();

    if (!password) {
      return unauthorized('Geçersiz şifre.');
    }

    let valid = false;

    // 1) DB'de kullanıcı varsa DB'den dene
    const user = await dbGet<{ username: string; password_hash: string }>(
      'SELECT username, password_hash FROM admin_users WHERE username = ?',
      [username || 'adminde']
    );

    if (user) {
      valid = await verifyPassword(password, user.password_hash);
    }

    // 2) DB'de kullanıcı yoksa env fallback'ini dene
    if (!user) {
      if (ADMIN_PASSWORD_HASH) {
        valid = await verifyPassword(password, ADMIN_PASSWORD_HASH);
      } else if (ADMIN_PASSWORD_FALLBACK) {
        valid = (password === ADMIN_PASSWORD_FALLBACK);
      }
    }

    if (valid) {
      loginAttempts.delete(ip);
      await createSession(ip);
      await auditLog({ action: 'login', entity: 'login', actor: ip, ip_address: ip, details: { success: true, username: user?.username || 'env' } });
      return ok({ authenticated: true });
    }

    const newCount = (attempt?.count || 0) + 1;
    await auditLog({ action: 'login', entity: 'login', actor: ip, ip_address: ip, details: { success: false, attempt: newCount } });
    loginAttempts.set(ip, {
      count: newCount,
      resetAt: now + 15 * 1000 * 60,
    });

    return unauthorized('Geçersiz şifre.');
  } catch (error) {
    return serverError(error);
  }
}
