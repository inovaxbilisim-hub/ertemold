export interface GeminiResponse {
  content: string;
  tokensUsed: number;
  usedKeyIndex?: number; // For debugging: which key was used
}

const RATE_LIMIT_CODES = [429, 503];
const RATE_LIMIT_KEYWORDS = ['RESOURCE_EXHAUSTED', 'quota', 'rate limit', 'too many requests'];

function isRateLimitError(errorText: string, status: number): boolean {
  if (RATE_LIMIT_CODES.includes(status)) return true;
  const lower = errorText.toLowerCase();
  return RATE_LIMIT_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
}

function isTransientNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as any;
  const message = String(err.message || '').toLowerCase();
  const code = String(err?.cause?.code || err.code || '').toLowerCase();

  const transientCodes = ['und_err_connect_timeout', 'ecoff', 'ecancelled', 'econnreset', 'etimedout', 'enetunreach', 'enotfound', 'eai_again'];
  const transientMessages = ['connect timeout', 'network timeout', 'timeout', 'network error', 'fetch failed', 'failed to fetch', 'socket hang up', 'aborted'];

  return transientCodes.some((item) => code.includes(item)) || transientMessages.some((item) => message.includes(item));
}

/**
 * Core function: attempts a single Gemini API call with one key.
 * Throws on failure so the caller can rotate keys.
 */
async function attemptGeminiRequest(
  prompt: string,
  apiKey: string,
  model: string
): Promise<GeminiResponse> {
  const isJsonRequest = prompt.toLowerCase().includes('json');
  const controller = new AbortController();
  const timeoutMs = 90000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          systemInstruction: {
            parts: [{
              text: `Sen uzman bir SEO içerik yazarısın. ${
                isJsonRequest
                  ? 'ÇOK ÖNEMLİ: Yanıtını MUTLAKA JSON formatında döndür. HTML paragrafları, bold metinler gibi içerikler JSON string değerleri içinde olmalı. Yanıtının tamamı geçerli bir JSON array olmalı. Hiçbir açıklama, markdown veya ek metin ekleme. Sadece [ ile başlayıp ] ile biten JSON array döndür.'
                  : 'Asla markdown formatı veya tırnak işaretleri kullanma (özellikle istenmedikçe). SADECE içerik metnini döndür.'
              }`,
            }],
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8000,
            ...(isJsonRequest ? { response_mime_type: 'application/json' } : {}),
          },
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      const err = new Error(`Gemini API error: ${response.status} ${errorData}`);
      (err as any).status = response.status;
      (err as any).isRateLimit = isRateLimitError(errorData, response.status);
      throw err;
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const tokensUsed = data.usageMetadata?.totalTokenCount || 0;
    
    // Check if response was truncated
    const finishReason = data.candidates?.[0]?.finishReason;
    if (finishReason === 'MAX_TOKENS' || finishReason === 'STOP') {
      console.log(`[Gemini] Response finishReason: ${finishReason}, tokens: ${tokensUsed}`);
    }
    if (finishReason === 'MAX_TOKENS') {
      console.warn(`[Gemini] WARNING: Response was truncated due to MAX_TOKENS limit`);
    }

    return { content, tokensUsed };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (isTransientNetworkError(err)) {
      const transientErr = new Error(`Gemini network/transient error: ${err.message}`);
      (transientErr as any).isTransient = true;
      throw transientErr;
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Generates content using Gemini with automatic key rotation.
 *
 * Strategy:
 * 1. Build a pool from: [primary key, ...extra keys]
 * 2. Try each key in order.
 * 3. If a key gets a rate-limit / quota error → log a warning, try next key.
 * 4. If a key gets a non-rate-limit error (bad prompt, invalid key, etc.) → throw immediately.
 * 5. If all keys are exhausted → throw a clear "all keys quota exceeded" error.
 */
export async function generateGeminiContent(
  prompt: string,
  apiKey: string,
  selectedModel?: string,
  extraKeys?: string[]
): Promise<GeminiResponse> {
  // Fallback to gemini-2.5-flash if no specific model is selected
  const model = selectedModel || 'gemini-2.5-flash';

  // Build deduplicated key pool (primary first, then extras)
  const allKeys = [apiKey, ...(extraKeys || [])]
    .map(k => k?.trim())
    .filter(Boolean)
    .filter((k, i, arr) => arr.indexOf(k) === i); // deduplicate

  if (allKeys.length === 0) {
    throw new Error('Gemini API Key is missing');
  }

  let lastError: Error | null = null;

  for (let i = 0; i < allKeys.length; i++) {
    const key = allKeys[i];
    try {
      const result = await attemptGeminiRequest(prompt, key, model);
      if (i > 0) {
        console.warn(`[Gemini] Key #${i + 1} succeeded after ${i} failed attempt(s).`);
      }
      return { ...result, usedKeyIndex: i };
    } catch (err: any) {
      lastError = err;
      if (err.isRateLimit) {
        console.warn(`[Gemini] Key #${i + 1} hit rate limit, trying next key... (${err.message.substring(0, 80)})`);
        continue; // Try next key
      }
      if (err.isTransient) {
        console.warn(`[Gemini] Key #${i + 1} hit a transient network error, trying next key... (${err.message.substring(0, 80)})`);
        continue;
      }
      // Non-rate-limit, non-transient error (bad key format, content blocked, etc.) → fail fast
      throw err;
    }
  }

  // All keys exhausted
  const isNetworkError = lastError && 'isTransient' in lastError;
  const errorType = isNetworkError ? 'ağ/kota' : 'kota';
  throw new Error(
    `Tüm Gemini API key'leri ${errorType} sınırına ulaştı veya ağ hatası aldı (${allKeys.length} key denendi). ` +
    `Son hata: ${lastError?.message || 'Bilinmeyen hata'}`
  );
}
