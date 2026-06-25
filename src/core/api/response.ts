import { NextResponse } from "next/server";

// ─── Standart API Yanıt Tipi ───────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  details?: string;
}

type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ─── Yardımcı Builder Fonksiyonları ───────────────────────────────────────

/** 200 OK — veriyle birlikte başarı yanıtı */
export function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

/** 201 Created */
function created<T>(data: T): NextResponse<ApiSuccess<T>> {
  return ok(data, 201);
}

/** 204 No Content — başarılı işlem, dönen veri yok (DELETE vb.) */
function noContent(): NextResponse<ApiSuccess<null>> {
  return ok(null, 204);
}

/** 400 Bad Request */
export function badRequest(
  error: string,
  details?: string,
): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error, details }, { status: 400 });
}

/** 401 Unauthorized */
export function unauthorized(error = "Unauthorized"): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status: 401 });
}

/** 404 Not Found */
export function notFound(error = "Not found"): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status: 404 });
}

/** 405 Method Not Allowed */
export function methodNotAllowed(): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error: "Method not allowed" },
    { status: 405 },
  );
}

/** 429 Too Many Requests */
export function tooManyRequests(
  error = "Too many requests",
): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status: 429 });
}

/** 500 Internal Server Error */
export function serverError(error: unknown): NextResponse<ApiError> {
  console.error("[serverError]", error);
  const message = error instanceof Error ? error.message : String(error);
  return NextResponse.json(
    { success: false, error: "Internal Server Error", details: message },
    { status: 500 },
  );
}
