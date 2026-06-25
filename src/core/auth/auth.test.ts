import { describe, test, expect, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { isValidToken } from './session';

// NOT: Bu testler DB gerektirir. CI'da çalışmaz.
// Bu dosya auth mantığının offline testleri içindir.

describe('isValidToken', () => {
  test('returns false for undefined token', async () => {
    expect(await isValidToken(undefined)).toBe(false);
  });

  test('returns false for empty token', async () => {
    expect(await isValidToken('')).toBe(false);
  });
});
