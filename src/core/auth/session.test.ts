import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDbGet = vi.fn();

vi.mock('@/core/database/db', () => ({
  dbGet: (...args: unknown[]) => mockDbGet(...args),
}));

vi.mock('server-only', () => ({}));

beforeEach(() => {
  vi.clearAllMocks();
  mockDbGet.mockReset();
});

describe('isValidToken', () => {
  it('should return false for undefined token', async () => {
    const { isValidToken } = await import('./session');
    expect(await isValidToken(undefined)).toBe(false);
  });

  it('should return false for empty token', async () => {
    const { isValidToken } = await import('./session');
    expect(await isValidToken('')).toBe(false);
  });

  it('should return true for valid token from DB', async () => {
    mockDbGet.mockResolvedValue({ token: 'valid-token' });

    const { isValidToken } = await import('./session');
    expect(await isValidToken('valid-token')).toBe(true);
    expect(mockDbGet).toHaveBeenCalledWith(
      'SELECT token FROM admin_sessions WHERE token = ? AND expires_at > ? LIMIT 1',
      ['valid-token', expect.any(String)],
    );
  });

  it('should return false for invalid token from DB', async () => {
    mockDbGet.mockResolvedValue(null);

    const { isValidToken } = await import('./session');
    expect(await isValidToken('invalid-token')).toBe(false);
  });

  it('should cache valid result within TTL', async () => {
    mockDbGet.mockResolvedValue({ token: 'cached-token' });

    const { isValidToken } = await import('./session');

    expect(await isValidToken('cached-token')).toBe(true);
    expect(await isValidToken('cached-token')).toBe(true);
    expect(mockDbGet).toHaveBeenCalledTimes(1);
  });

  it('should return false on DB error', async () => {
    mockDbGet.mockRejectedValue(new Error('DB connection failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { isValidToken } = await import('./session');
    expect(await isValidToken('error-token')).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
