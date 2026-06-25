export interface OpenRouterResponse {
  content: string;
  tokensUsed: number;
  estimatedCost: number; // in USD
  usedKeyIndex?: number;
}

const RATE_LIMIT_CODES = [429, 503];
const RATE_LIMIT_KEYWORDS = ['quota', 'rate limit', 'too many requests', 'insufficient_quota', 'payment_required'];

function isRateLimitError(errorText: string, status: number): boolean {
  if (RATE_LIMIT_CODES.includes(status)) return true;
  const lower = errorText.toLowerCase();
  return RATE_LIMIT_KEYWORDS.some(kw => lower.includes(kw));
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

async function attemptOpenRouterRequest(prompt: string, apiKey: string, model: string): Promise<OpenRouterResponse> {
  const COST_PER_TOKEN = 0.15 / 1000000;
  const normalizedKey = apiKey.trim();
  if (!normalizedKey) throw new Error('OpenRouter API Key is missing');

  const isBearerAuth = normalizedKey.toLowerCase().startsWith('bearer ');
  const keyValue = isBearerAuth ? normalizedKey.slice(7).trim() : normalizedKey;

  const controller = new AbortController();
  const timeoutMs = 90000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${keyValue}`,
        'X-OpenRouter-Api-Key': keyValue,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO content writer. Write concise, highly engaging, and grammatically perfect Turkish content. Never include markdown formatting or quotes unless specifically asked. Return ONLY the content text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      if (isRateLimitError(errorText, response.status)) {
        const err = new Error(`RATE_LIMIT: ${response.status}`);
        (err as any).status = response.status;
        (err as any).errorText = errorText;
        throw err;
      }

      let normalizedError: unknown = errorText;
      try { normalizedError = JSON.parse(errorText); } catch { /* ignore */ }
      const message = typeof normalizedError === 'object' && normalizedError !== null
        ? ((normalizedError as any)?.error?.message || (normalizedError as any)?.message || JSON.stringify(normalizedError))
        : String(normalizedError);

      throw new Error(`OpenRouter API error: ${response.status} ${message}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    const totalTokens = (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0);
    const cost = data.usage?.total_cost || (totalTokens * COST_PER_TOKEN);

    return { content: content.trim(), tokensUsed: totalTokens, estimatedCost: cost };
  } catch (err: unknown) {
    if (isTransientNetworkError(err)) {
      const nErr = new Error('NETWORK_TIMEOUT');
      (nErr as any).original = err;
      throw nErr;
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateAiContent(prompt: string, apiKey: string, selectedModel?: string, extraKeys: string[] = []): Promise<OpenRouterResponse> {
  if (!apiKey) throw new Error('OpenRouter API Key is missing');

  let model = selectedModel ? String(selectedModel).trim() : '';
  if (!model || model === 'openrouter/free' || !model.includes('/')) {
    model = 'aion-labs/aion-1.0-mini';
  }

  const allKeys = [apiKey, ...extraKeys].filter(k => k && k.trim());
  if (allKeys.length === 0) throw new Error('No valid OpenRouter API keys found.');

  let lastError: Error | null = null;

  for (let i = 0; i < allKeys.length; i++) {
    const key = allKeys[i];
    try {
      const result = await attemptOpenRouterRequest(prompt, key, model);
      if (i > 0) {
        console.warn(`[OPENROUTER] Primary key failed. Successfully fell back to key index #${i + 1}`);
      }
      return { ...result, usedKeyIndex: i };
    } catch (err: any) {
      lastError = err;
      const isRateLimit = err.message?.startsWith('RATE_LIMIT');
      const isTimeout = err.message === 'NETWORK_TIMEOUT';

      if (isRateLimit || isTimeout) {
        console.warn(`[OPENROUTER] Key #${i + 1} failed (${isRateLimit ? 'Rate Limit / Quota' : 'Timeout'}). ${i < allKeys.length - 1 ? 'Trying next key...' : 'No more keys.'}`);
        continue;
      }

      console.error(`[OPENROUTER] Fatal error with key #${i + 1}:`, err);
      throw err;
    }
  }

  throw new Error(`All OpenRouter API keys failed. Last error: ${lastError?.message}`);
}
