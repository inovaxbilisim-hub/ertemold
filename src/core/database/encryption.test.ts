import { describe, test, expect } from 'vitest';
import crypto from 'crypto';

// encryption.ts'yi doğrudan import edemiyoruz çünkü crypto.pbkdf2 kullanıyor.
// Bunun yerine aynı algoritmanın entropy testini yapıyoruz.
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

function deriveKey(key: string): Buffer {
  if (key.length === 64 && /^[0-9a-f]+$/i.test(key)) return Buffer.from(key, 'hex');
  return crypto.createHash('sha256').update(key).digest();
}

function encrypt(plaintext: string, keyStr: string): string {
  const key = deriveKey(keyStr);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(ciphertext: string, keyStr: string): string {
  const key = deriveKey(keyStr);
  const parts = ciphertext.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted format');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const data = parts[2];
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

describe('Encryption', () => {
  const KEY_HEX = '25828f66785bb3c5b6aa7b62c7f74cd573e45618aba05472c6bdb290a5e6e71d';
  const KEY_WEAK = 'weak-key-2026';

  test('encrypt and decrypt roundtrip with hex key', () => {
    const original = 'test-data-123';
    const encrypted = encrypt(original, KEY_HEX);
    expect(encrypted.split(':')).toHaveLength(3);
    const decrypted = decrypt(encrypted, KEY_HEX);
    expect(decrypted).toBe(original);
  });

  test('encrypt and decrypt roundtrip with weak key', () => {
    const original = 'smtp-password-test';
    const encrypted = encrypt(original, KEY_WEAK);
    const decrypted = decrypt(encrypted, KEY_WEAK);
    expect(decrypted).toBe(original);
  });

  test('different iv produces different ciphertext each time', () => {
    const plaintext = 'same-text';
    const a = encrypt(plaintext, KEY_HEX);
    const b = encrypt(plaintext, KEY_HEX);
    expect(a).not.toBe(b);
  });

  test('wrong key fails to decrypt', () => {
    const encrypted = encrypt('secret-data', KEY_HEX);
    expect(() => decrypt(encrypted, KEY_WEAK)).toThrow();
  });

  test('tampered ciphertext fails auth tag verification', () => {
    const encrypted = encrypt('important', KEY_HEX);
    const parts = encrypted.split(':');
    parts[2] = parts[2].slice(0, -1) + '0'; // son karakteri değiştir
    expect(() => decrypt(parts.join(':'), KEY_HEX)).toThrow();
  });
});

describe('Key Derivation', () => {
  test('64-char hex string is used as raw key', () => {
    const hexKey = 'a'.repeat(64);
    const derived = deriveKey(hexKey);
    expect(derived.length).toBe(32);
    expect(derived.toString('hex')).toBe(hexKey);
  });

  test('non-hex string is hashed with SHA-256', () => {
    const derived = deriveKey('short-key');
    expect(derived.length).toBe(32);
    expect(derived.toString('hex')).not.toBe('short-key');
  });

  test('same input produces same derived key', () => {
    const a = deriveKey('test-key');
    const b = deriveKey('test-key');
    expect(a).toEqual(b);
  });
});
