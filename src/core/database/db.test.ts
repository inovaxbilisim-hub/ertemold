import { describe, test, expect } from 'vitest';

// DB utilitiy functionlarını doğrudan test ediyoruz
// (db.ts'den import edilemeyen private functionlar için inline kopya)

function sanitizeParams(params: unknown[]): any[] {
  if (!params) return [];
  return params.map(p => {
    if (p === undefined) return null;
    if (p !== null && typeof p === 'object' && !(p instanceof Date)) {
      try { return JSON.stringify(p); } catch { return String(p); }
    }
    return p;
  });
}

function normalizeQueryPlaceholders(query: string): string {
  let index = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escaped = false;
  let result = '';

  for (let i = 0; i < query.length; i++) {
    const char = query[i];

    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      result += char;
      continue;
    }

    if (char === "'") {
      inSingleQuote = !inSingleQuote && !inDoubleQuote ? true : inSingleQuote ? false : inSingleQuote;
      result += char;
      continue;
    }

    if (char === '"') {
      inDoubleQuote = !inDoubleQuote && !inSingleQuote ? true : inDoubleQuote ? false : inDoubleQuote;
      result += char;
      continue;
    }

    if (char === '?' && !inSingleQuote && !inDoubleQuote) {
      index += 1;
      result += `$${index}`;
      continue;
    }

    result += char;
  }

  return result;
}

function extractRows<T>(result: any): T[] {
  if (!result) return [];
  if (Array.isArray(result)) return result as T[];
  if (result.rows && Array.isArray(result.rows)) return result.rows as T[];
  return [];
}

function parseDbJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    if (value === '') return fallback;
    try { return JSON.parse(value) as T; } catch { return fallback; }
  }
  return value as T;
}

describe('sanitizeParams', () => {
  test('returns empty array for null/undefined input', () => {
    expect(sanitizeParams(null as any)).toEqual([]);
    expect(sanitizeParams(undefined as any)).toEqual([]);
  });

  test('converts undefined to null', () => {
    expect(sanitizeParams([undefined])).toEqual([null]);
  });

  test('stringifies objects', () => {
    const result = sanitizeParams([{ foo: 'bar' }]);
    expect(result[0]).toBe('{"foo":"bar"}');
  });

  test('passes primitives through', () => {
    expect(sanitizeParams([1, 'hello', true, null])).toEqual([1, 'hello', true, null]);
  });

  test('handles Date objects without stringifying', () => {
    const d = new Date('2024-01-01');
    expect(sanitizeParams([d])[0]).toBe(d);
  });
});

describe('normalizeQueryPlaceholders', () => {
  test('replaces ? with $1, $2, etc.', () => {
    expect(normalizeQueryPlaceholders('SELECT * FROM t WHERE a = ? AND b = ?'))
      .toBe('SELECT * FROM t WHERE a = $1 AND b = $2');
  });

  test('skips ? inside single quotes', () => {
    expect(normalizeQueryPlaceholders("SELECT '?' as q WHERE a = ?"))
      .toBe("SELECT '?' as q WHERE a = $1");
  });

  test('skips ? inside double quotes', () => {
    expect(normalizeQueryPlaceholders('SELECT "?" as q WHERE a = ?'))
      .toBe('SELECT "?" as q WHERE a = $1');
  });

  test('handles escaped quotes', () => {
    expect(normalizeQueryPlaceholders("SELECT '\\'?' WHERE a = ?"))
      .toBe("SELECT '\\'?' WHERE a = $1");
  });

  test('no placeholder returns same query', () => {
    expect(normalizeQueryPlaceholders('SELECT 1')).toBe('SELECT 1');
  });
});

describe('extractRows', () => {
  test('returns empty array for null/undefined', () => {
    expect(extractRows(null)).toEqual([]);
    expect(extractRows(undefined)).toEqual([]);
  });

  test('returns array directly', () => {
    expect(extractRows([{ id: 1 }])).toEqual([{ id: 1 }]);
  });

  test('extracts .rows from result object', () => {
    expect(extractRows({ rows: [{ id: 1 }] })).toEqual([{ id: 1 }]);
  });

  test('returns empty array for unknown shape', () => {
    expect(extractRows({ foo: 'bar' })).toEqual([]);
  });
});

describe('parseDbJson', () => {
  test('returns fallback for null/undefined', () => {
    expect(parseDbJson(null, [])).toEqual([]);
    expect(parseDbJson(undefined, {})).toEqual({});
  });

  test('parses valid JSON string', () => {
    expect(parseDbJson('{"a":1}', {})).toEqual({ a: 1 });
  });

  test('returns fallback for empty string', () => {
    expect(parseDbJson('', [])).toEqual([]);
  });

  test('returns fallback for invalid JSON', () => {
    expect(parseDbJson('{invalid}', [])).toEqual([]);
  });

  test('passes through objects', () => {
    const obj = { a: 1 };
    expect(parseDbJson(obj, {})).toBe(obj);
  });
});
