import "server-only";
import { Pool as PgPool } from "pg";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;
// Eğer sunucu WebSocket bağlantı limitini aşıyorsa: fetch (HTTP) üzerinden çalışması için
neonConfig.poolQueryViaFetch = true;

let pool: PgPool | NeonPool | null = null;

function getSql() {
  if (pool) return pool;

  const url = process.env.DATABASE_URL;
  if (!url) {
    return {
      query: async (q: string) => {
        const errorMsg =
          "CRITICAL: DATABASE_URL environment variable is missing. " +
          "Please add it to Vercel Project Settings -> Environment Variables. " +
          `Attempted query: ${q.substring(0, 50)}...`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      },
    } as any;
  }

  if (process.env.NODE_ENV === 'development') {
    // Geliştirme (Local) ortamında standart 'pg' sürücüsünü kullan
    pool = new PgPool({
      connectionString: url,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  } else {
    pool = new NeonPool({
      connectionString: url,
    });
  }

  // Neon'un Connection Pooler'ı (PgBouncer) search_path ayarını bazen kaybedebiliyor.
  // Her yeni bağlantı açıldığında search_path'i public olarak ayarlayalım.
  pool.on("connect", (client) => {
    client.query("SET search_path TO public;").catch((err: any) => {
      console.error("[DB] Failed to set search_path on connect:", err);
    });
  });

  pool.on("error", (err: Error) => {
    console.error("[DB] Unexpected PgPool error:", err.message);
  });

  return pool;
}

// Internal helper for this module
const sql = () => getSql();

function sanitizeParams(params: unknown[]): any[] {
  if (!params) return [];
  return params.map((p) => {
    if (p === undefined) return null;
    // For pSEO and other JSON-like fields, ensure objects are stringified if needed
    if (p !== null && typeof p === "object" && !(p instanceof Date)) {
      try {
        return JSON.stringify(p);
      } catch {
        return String(p);
      }
    }
    return p;
  });
}

function normalizeQueryPlaceholders(query: string): string {
  let index = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escaped = false;
  let result = "";

  for (let i = 0; i < query.length; i++) {
    const char = query[i];

    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      result += char;
      continue;
    }

    if (char === "'") {
      inSingleQuote =
        !inSingleQuote && !inDoubleQuote
          ? true
          : inSingleQuote
            ? false
            : inSingleQuote;
      result += char;
      continue;
    }

    if (char === '"') {
      inDoubleQuote =
        !inDoubleQuote && !inSingleQuote
          ? true
          : inDoubleQuote
            ? false
            : inDoubleQuote;
      result += char;
      continue;
    }

    if (char === "?" && !inSingleQuote && !inDoubleQuote) {
      index += 1;
      result += `$${index}`;
      continue;
    }

    result += char;
  }

  return result;
}

// Helper to normalize Neon results (sometimes it returns rows array directly, sometimes a result object with .rows)
function extractRows<T>(result: any): T[] {
  if (!result) return [];
  if (Array.isArray(result)) return result as T[];
  if (result.rows && Array.isArray(result.rows)) return result.rows as T[];
  return [];
}

export async function dbGet<T>(
  query: string,
  params: unknown[] = [],
): Promise<T | null> {
  const result = await sql().query(
    normalizeQueryPlaceholders(query),
    sanitizeParams(params),
  );
  const rows = extractRows<T>(result);
  return rows[0] ?? null;
}

export async function dbAll<T>(
  query: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await sql().query(
    normalizeQueryPlaceholders(query),
    sanitizeParams(params),
  );
  return extractRows<T>(result);
}

export async function dbRun(query: string, params: unknown[] = []) {
  const result = await sql().query(
    normalizeQueryPlaceholders(query),
    sanitizeParams(params),
  );
  const rows = extractRows<any>(result);
  return { rows, lastInsertRowid: null, columns: [] };
}

export async function dbExec(query: string) {
  const result = await sql().query(normalizeQueryPlaceholders(query));
  const rows = extractRows<any>(result);
  return { rows };
}

export async function ensureTableColumn(
  table: string,
  column: string,
  definition: string,
) {
  const checkSql = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = $1 AND column_name = $2
  `;
  const result = await sql().query(checkSql, [
    table.toLowerCase(),
    column.toLowerCase(),
  ]);
  const rows = extractRows<any>(result);

  if (rows.length === 0) {
    try {
      let pgDefinition = definition.toUpperCase();
      if (pgDefinition.includes("INTEGER"))
        pgDefinition = pgDefinition.replace("INTEGER", "INTEGER");
      if (pgDefinition.includes("DATETIME"))
        pgDefinition = pgDefinition.replace("DATETIME", "TIMESTAMP");
      if (pgDefinition.includes("REAL"))
        pgDefinition = pgDefinition.replace("REAL", "DOUBLE PRECISION");
      if (pgDefinition.includes("TEXT DEFAULT 'OFF'"))
        pgDefinition = "TEXT DEFAULT 'off'";

      await sql().query(
        `ALTER TABLE ${table} ADD COLUMN ${column} ${pgDefinition}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // 'already exists': kolon zaten var (race condition)
      // '42501' / 'permission denied' / 'sahibi olmalısınız': yetki yok → atla
      if (
        !message.toLowerCase().includes("already exists") &&
        !message.includes("42501") &&
        !message.toLowerCase().includes("sahibi") &&
        !message.toLowerCase().includes("permission denied")
      ) {
        throw error;
      }
    }
  }
}

export async function dbBatch(statements: { sql: string; args?: unknown[] }[]) {
  if (statements.length === 0) return [];
  const results = [];
  for (const s of statements) {
    const result = await sql().query(
      normalizeQueryPlaceholders(s.sql),
      sanitizeParams(s.args ?? []),
    );
    results.push({ rows: extractRows<any>(result) });
  }
  return results;
}

export async function dbUpsert(
  table: string,
  data: Record<string, unknown>,
  primaryKey = "id",
) {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const pkValue = data[primaryKey];

  // Atomik PostgreSQL UPSERT: ON CONFLICT DO UPDATE
  // Bu yöntem, eşzamanlı serverless çağrılarında race condition ve duplicate kayıt riskini önler.
  // primaryKey sağlanmamışsa veya değeri yoksa sadece INSERT yapılır.
  if (pkValue !== undefined && pkValue !== null) {
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    const colNames = columns.map((col) => `"${col}"`).join(", ");
    const updateColumns = columns.filter((col) => col !== primaryKey);
    const setClause = updateColumns
      .map((col) => `"${col}" = EXCLUDED."${col}"`)
      .join(", ");

    const insertQuery = `
      INSERT INTO "${table}" (${colNames}) VALUES (${placeholders})
      ON CONFLICT ("${primaryKey}") DO UPDATE SET ${setClause}
    `;
    const result = await sql().query(insertQuery, sanitizeParams(values));
    return { rows: extractRows<any>(result) };
  }

  // primaryKey yoksa basit INSERT
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
  const colNames = columns.map((col) => `"${col}"`).join(", ");
  const insertQuery = `INSERT INTO "${table}" (${colNames}) VALUES (${placeholders})`;
  const result = await sql().query(insertQuery, sanitizeParams(values));
  return { rows: extractRows<any>(result) };
}

export async function dbInsert(table: string, data: Record<string, unknown>) {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
  const colNames = columns.map((col) => `"${col}"`).join(", ");

  const query = `INSERT INTO ${table} (${colNames}) VALUES (${placeholders})`;
  const result = await sql().query(query, sanitizeParams(values));
  return { rows: extractRows<any>(result) };
}

export async function dbDelete(
  table: string,
  whereColumn: string,
  whereValue: unknown,
) {
  const query = `DELETE FROM ${table} WHERE ${whereColumn} = $1`;
  const result = await sql().query(query, sanitizeParams([whereValue]));
  return { rows: extractRows<any>(result) };
}

/**
 * Shared JSON parse utility — Neon'dan gelen alanlar bazen string, bazen object gelir.
 * Bu helper ikisini de ele alır ve parse hatalarında fallback döner.
 *
 * Kullanım: parseDbJson(row.features, [])
 *           parseDbJson(row.brand, {})
 */
export function parseDbJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    if (value === "") return fallback;
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

/**
 * Catch bloklarında `unknown` tip hatasını güvenli şekilde string'e dönüştürür.
 * Kullanım: catch (error: unknown) { return NextResponse.json({ error: getErrorMessage(error) }) }
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/**
 * Tablo + where koşulu ile tek satır günceller.
 * Kullanım: await dbUpdate('services', { title: 'Yeni' }, { id: 5 })
 */
async function dbUpdate(
  table: string,
  data: Record<string, unknown>,
  where: Record<string, unknown>,
): Promise<{ rows: any[] }> {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const whereKeys = Object.keys(where);
  const whereValues = Object.values(where);

  const setClause = columns.map((col, i) => `"${col}" = $${i + 1}`).join(", ");
  const whereClause = whereKeys
    .map((col, i) => `"${col}" = $${columns.length + i + 1}`)
    .join(" AND ");

  const query = `UPDATE "${table}" SET ${setClause} WHERE ${whereClause}`;
  const result = await getSql().query(
    query,
    sanitizeParams([...values, ...whereValues]),
  );
  return { rows: extractRows<any>(result) };
}
