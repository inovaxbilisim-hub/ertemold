import { verifySession } from '@/core/auth/auth';
import { getAIConfig } from '@/modules/settings/lib/data-settings';
import { ok, unauthorized, badRequest, serverError } from '@/core/api/response';

// Import AI providers
import { generateAiContent } from '@/modules/ai/lib/openrouter';
import { generateGeminiContent } from '@/modules/ai/lib/gemini';

interface FaqItem {
  question: string;
  answer: string;
}

function parseHtmlFaqFormat(raw: string): FaqItem[] | null {
  // Strategy 1: Pair <h3>...</h3> (questions) with <p>...</p> (answers)
  const h3Questions = [...raw.matchAll(/<h[1-6][^>]*>[\s\S]*?\?[\s\S]*?<\/h[1-6]>/gi)].map(m => {
    const text = m[0].replace(/<[^>]+>/g, '').replace(/^Soru\s*\d+[\.:\)]\s*/i, '').trim();
    return text;
  }).filter(q => q);
  
  const pAnswers = [...raw.matchAll(/<p>[\s\S]*?<\/p>/g)].map(m => m[0]);
  
  if (h3Questions.length >= 2 && pAnswers.length >= 2) {
    const count = Math.min(h3Questions.length, pAnswers.length);
    const items: FaqItem[] = [];
    for (let i = 0; i < count; i++) {
      if (h3Questions[i] && pAnswers[i]) {
        items.push({ question: h3Questions[i], answer: pAnswers[i] });
      }
    }
    if (items.length >= 2) return items;
  }
  
  // Strategy 2: Find all <p> blocks and pair with preceding <h3> text
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const allQuestions: string[] = [];
  const allAnswers: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Line with <h> tag containing ? is a question
    if (/^<h[1-6]/.test(line) && line.includes('?')) {
      const text = line.replace(/<[^>]+>/g, '').replace(/^Soru\s*\d+[\.:\)]\s*/i, '').trim();
      allQuestions.push(text);
    }
    // Line with <p> is an answer
    else if (/^<p>/.test(line)) {
      allAnswers.push(line);
    }
    // Line with ? but no HTML - could also be a question (for plain text formats)
    else if (line.includes('?') && !line.startsWith('<') && !line.startsWith('-')) {
      allQuestions.push(line.replace(/^\d+[\.\)]\s*/, '').trim());
    }
  }
  
  if (allQuestions.length >= 2 && allAnswers.length >= 2) {
    const count = Math.min(allQuestions.length, allAnswers.length);
    return allQuestions.slice(0, count).map((q, i) => ({
      question: q,
      answer: allAnswers[i],
    }));
  }
  
  return null;
}

function extractJsonArray(raw: string): string | null {
  // Remove markdown code blocks
  const cleaned = raw.replace(/```(?:json)?\s?/g, '').replace(/```/g, '').trim();
  
  // Find first [
  const firstOpen = cleaned.indexOf('[');
  if (firstOpen === -1) return null;

  let balance = 0;
  let inString = false;
  let escaped = false;
  let lastClose = -1;

  for (let i = firstOpen; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (char === '"' && !escaped) {
      inString = !inString;
    }

    if (!inString) {
      if (char === '[') balance++;
      if (char === ']') {
        balance--;
        if (balance === 0) {
          lastClose = i;
          break;
        }
      }
    }

    escaped = char === '\\' && !escaped;
  }

  if (lastClose === -1) {
    return cleaned.substring(firstOpen);
  }

  return cleaned.substring(firstOpen, lastClose + 1);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const isBot = url.searchParams.get('bot') === 'ertem-bot-internal';
  const isAuth = isBot || await verifySession();
  if (!isAuth) return unauthorized();

  console.log('[AI-FAQ-GEN] Request received');

  try {
    const body = await request.json();
    const { serviceTitle, serviceDescription, existingFaqCount = 0, type } = body;

    console.log('[AI-FAQ-GEN] Input:', { serviceTitle, type, existingFaqCount });

    if (!serviceTitle) {
      console.error('[AI-FAQ-GEN] Missing title');
      return badRequest('Başlık (title) is required');
    }

    const settings = await getAIConfig();
    console.log('[AI-FAQ-GEN] Settings loaded:', { 
      provider: settings?.ai_provider,
      hasGeminiKey: !!settings?.gemini_api_key,
      hasOpenRouterKey: !!settings?.openrouter_api_key 
    });
    
    const provider = settings?.ai_provider;
    
    if (!provider) {
      console.error('[AI-FAQ-GEN] No AI provider configured');
      return badRequest('AI sağlayıcısı ayarlanmamış. Lütfen Genel Ayarlar > Yapay Zeka sekmesinden sağlayıcı seçin.');
    }

    const apiKey = provider === 'gemini' ? settings?.gemini_api_key : settings?.openrouter_api_key;
    
    if (!apiKey) {
      console.error('[AI-FAQ-GEN] No API key found for provider:', provider);
      return badRequest(`${provider === 'gemini' ? 'Gemini' : 'OpenRouter'} API Key tanımlanmamış. Lütfen Genel Ayarlar > Yapay Zeka sekmesinden API anahtarınızı girin.`);
    }

    // Extra keys for rotation
    const extraGeminiKeys = provider === 'gemini' ? (settings?.gemini_api_keys || []).filter((k: string) => k && k !== apiKey) : [];
    const extraOpenRouterKeys = provider !== 'gemini' ? (settings?.openrouter_api_keys || []).filter((k: string) => k && k !== apiKey) : [];

    const companyName = settings.company_name || 'Firmamız';
    const providerModel = provider === 'gemini' ? (settings.gemini_ai_model || settings.ai_model) : (settings.openrouter_ai_model || settings.ai_model);
    const aiModel = (providerModel && providerModel !== 'openrouter/free' && String(providerModel).includes('/')) 
      ? providerModel 
      : '';
    
    // Check if it's a sector
    const isSector = type === 'sector';

    // Get custom FAQ prompt or use default
    // We will use the generic DB query since getAIConfig doesn't return sector fields
    let customPrompt = '';
    let minFaqCount = 3;

    if (isSector) {
      customPrompt = settings.ai_prompt_sector_faq || '';
      minFaqCount = settings.ai_sector_faq_min_count || 3;
    } else {
      customPrompt = settings.ai_prompt_faq || '';
      minFaqCount = settings.ai_faq_min_count || 8;
    }

    console.log('[AI-FAQ-GEN] AI Config:', { provider, model: aiModel || 'default', companyName, hasCustomPrompt: !!customPrompt, minFaqCount, isSector });

    // Calculate target count based on settings
    const targetCount = Math.max(minFaqCount, minFaqCount - existingFaqCount);

    const defaultSectorPrompt = `Sen "${companyName}" firması için çalışan, alanında otorite kabul edilen, üst düzey bir SEO ve müşteri hizmetleri uzmanısın.
GÖREV: "${serviceTitle}" sektörü için en az ${targetCount} adet profesyonel, SEO uyumlu ve kullanıcı odaklı Sıkça Sorulan Soru (SSS) oluştur.

Sektör: "${serviceTitle}"

GOOGLE ARAMA VERİLERİ ÖNCELİĞİ:
1. İnsanların Google'da en çok aradığı sektörel soru kalıplarına odaklan ("Bu sektöre özel epoksi neden gereklidir?", "Maliyeti nedir?", "Ne kadar sürer?").
2. Sorular SPESİFİK ve TEKNİK olmalı (genel sorular yerine bu sektöre özel sorular sor).
3. Cevaplar 2-3 cümle, HTML formatında olmalı ve sektör terimlerini içermelidir.
4. Her cevap <p> etiketi ile başlayıp bitmeli, <strong> ile vurgu yapılmalıdır.

YANIT FORMATI (KESİNLİKLE SADECE JSON ARRAY - Her cevap HTML formatında, tam cümle ve nokta ile bitmeli):
[
  {
    "question": "Teknik ve spesifik soru metni",
    "answer": "<p>Kısa, öz ve profesyonel cevap. <strong>Önemli vurgular</strong> için strong etiketi kullan.</p>"
  }
]`;

    const defaultServicePrompt = `Sen "${companyName}" firması için çalışan, alanında otorite kabul edilen, üst düzey bir SEO ve müşteri hizmetleri uzmanısın.

GÖREV: "${serviceTitle}" hizmeti için en az ${targetCount} adet profesyonel, SEO uyumlu ve kullanıcı odaklı Sıkça Sorulan Soru (SSS) oluştur.

HİZMET BİLGİSİ:
- Başlık: ${serviceTitle}
${serviceDescription ? `- Açıklama: ${serviceDescription}` : ''}

GOOGLE ARAMA VERİLERİ ÖNCELİĞİ:
⚠️ ÇOK ÖNEMLİ: Kullanıcıların Google'da "${serviceTitle}" için EN ÇOK ARADIĞI sorulara odaklan:
- "${serviceTitle} fiyatları" → Fiyat aralığı, maliyet faktörleri
- "${serviceTitle} nedir" → Tanım, kullanım alanları
- "${serviceTitle} nasıl yapılır" → Uygulama süreci, adımlar
- "${serviceTitle} avantajları" → Faydalar, üstünlükler
- "${serviceTitle} dezavantajları" → Limitasyonlar, dikkat edilecekler
- "${serviceTitle} vs [alternatif]" → Karşılaştırmalar
- "${serviceTitle} dayanıklılık" → Ömür, garanti
- "${serviceTitle} bakım" → Koruma, temizlik
- "${serviceTitle} hangi sektörler" → Kullanım alanları
- "${serviceTitle} ne kadar sürer" → Uygulama süresi, kürlenme

SSS KURALLARI:
1. Her soru GERÇEK müşterilerin Google'da aradığı LONG-TAIL anahtar kelimeler içermeli
2. Sorular SPESIFIK ve TEKNIK olmalı (genel sorular YOK)
3. Cevaplar 2-3 cümle, HTML formatında, SEO anahtar kelimeleri içermeli
4. Her cevap <p> etiketi ile başlayıp bitmeli, <strong> ile vurgu yapılmalı
5. Listeleme gerekiyorsa <ul><li> kullan
6. Placeholder kullan: {service}, {city}, {location}
7. Her cevap nokta (.) ile bitmeli - YARIM CEVAP BIRAKMA

SEO OPTİMİZASYONU:
- Featured Snippet kazanmak için net, doğrudan cevaplar ver
- "Ne kadar", "Nasıl", "Neden" ile başlayan sorular tercih et
- Teknik terimler ve sektör jargonu kullan
- Rakamlar, ölçümler, standartlar belirt

ÖRNEK İYİ SORULAR (Google Arama Odaklı):
- "${serviceTitle} m² fiyatı ne kadardır ve hangi faktörler maliyeti etkiler?"
- "${serviceTitle} uygulama süreci kaç gün sürer ve hangi aşamalardan oluşur?"
- "${serviceTitle} için zemin hazırlığı nasıl yapılmalıdır?"
- "${serviceTitle} hangi sektörlerde ve hangi amaçlarla tercih edilir?"
- "${serviceTitle} ile [alternatif ürün] arasındaki teknik farklar nelerdir?"
- "${serviceTitle} kaplamanın ortalama dayanıklılık ömrü ne kadardır?"
- "${serviceTitle} bakımı nasıl yapılır ve ne sıklıkla gereklidir?"
- "${serviceTitle} uygulaması için ideal ortam koşulları nelerdir?"

YANIT FORMATI (KESİNLİKLE SADECE JSON ARRAY - Her cevap HTML formatında, tam cümle ve nokta ile bitmeli):

ÖNEMLİ: Sadece JSON array döndür, başka hiçbir açıklama veya metin ekleme!

[
  {
    "question": "Teknik ve spesifik soru metni",
    "answer": "<p>Kısa, öz ve profesyonel cevap. <strong>Önemli vurgular</strong> için strong etiketi kullan.</p>"
  },
  {
    "question": "İkinci soru (liste içeren)",
    "answer": "<p>Giriş cümlesi:</p><ul><li>Liste öğesi 1</li><li>Liste öğesi 2</li></ul><p>Sonuç cümlesi.</p>"
  }
]

DİKKAT:
- Sadece [ ile başlayıp ] ile biten JSON array döndür
- Başka hiçbir metin, açıklama veya markdown ekleme
- HTML etiketlerini string içinde normal şekilde kullan
- En az ${targetCount} SSS oluştur
- Her soru benzersiz olmalı`;

    const defaultPrompt = isSector ? defaultSectorPrompt : defaultServicePrompt;
    const prompt = customPrompt || defaultPrompt;
    
    // If using custom prompt, replace template variables
    const finalPrompt = prompt
      .replace(/\$\{serviceTitle\}/g, serviceTitle)
      .replace(/\{\{sectorName\}\}/g, serviceTitle)
      .replace(/\$\{serviceDescription\}/g, serviceDescription || '')
      .replace(/\$\{companyName\}/g, companyName)
      .replace(/\{\{companyName\}\}/g, companyName)
      .replace(/\$\{targetCount\}/g, String(targetCount))
      .replace(/\{\{targetCount\}\}/g, String(targetCount));
    
    console.log('[AI-FAQ-GEN] Using custom prompt:', !!customPrompt);
    console.log('[AI-FAQ-GEN] Final prompt length:', finalPrompt.length);

    let aiRes;
    try {
      console.log('[AI-FAQ-GEN] Calling AI provider:', provider);
      
      if (provider === 'gemini') {
        aiRes = await generateGeminiContent(finalPrompt, apiKey, aiModel, extraGeminiKeys);
      } else {
        aiRes = await generateAiContent(finalPrompt, apiKey, aiModel, extraOpenRouterKeys);
      }
      
      console.log('[AI-FAQ-GEN] AI Response received, length:', aiRes.content.length);
    } catch (providerError: any) {
      console.error('[AI-FAQ-GEN] Provider Error:', providerError);
      console.error('[AI-FAQ-GEN] Error details:', {
        message: providerError.message,
        stack: providerError.stack?.substring(0, 200)
      });
      return serverError(`Yapay zeka sağlayıcı hatası: ${providerError.message || String(providerError)}`);
    }

    try {
      let jsonStr = aiRes.content.trim();
      
      console.log('[AI-FAQ-GEN] ===== RAW AI RESPONSE =====');
      console.log('[AI-FAQ-GEN] Full response:', jsonStr);
      console.log('[AI-FAQ-GEN] Response length:', jsonStr.length);
      console.log('[AI-FAQ-GEN] ===== END RAW RESPONSE =====');
      
      // Clean markdown blocks
      jsonStr = jsonStr.replace(/```json\s?/g, '').replace(/```\s?/g, '').trim();
      
      // Extract JSON array
      const extractedJson = extractJsonArray(jsonStr) || jsonStr;
      
      console.log('[AI-FAQ-GEN] Extracted JSON (full):', extractedJson);
      
      let parsedData: FaqItem[];
      try {
        parsedData = JSON.parse(extractedJson);
        console.log('[AI-FAQ-GEN] Parsed successfully, array length:', Array.isArray(parsedData) ? parsedData.length : 'not an array');
      } catch (parseError) {
        console.error('[AI-FAQ-GEN] JSON Parse Error:', parseError);
        console.error('[AI-FAQ-GEN] Failed JSON (first 3000 chars):', extractedJson.substring(0, 3000));
        console.error('[AI-FAQ-GEN] Failed JSON (last 1000 chars):', extractedJson.substring(Math.max(0, extractedJson.length - 1000)));
        
        // Try fallback HTML parser before giving up
        console.log('[AI-FAQ-GEN] Trying fallback HTML parser...');
        const fallbackFaqs = parseHtmlFaqFormat(extractedJson);
        console.log('[AI-FAQ-GEN] Fallback parser result:', fallbackFaqs ? `${fallbackFaqs.length} FAQs found` : 'null');
        if (fallbackFaqs && fallbackFaqs.length >= 2) {
          console.log(`[AI-FAQ-GEN] Fallback parser succeeded: ${fallbackFaqs.length} FAQs`);
          console.log('[AI-FAQ-GEN] First fallback FAQ:', JSON.stringify(fallbackFaqs[0]));
          parsedData = fallbackFaqs;
        } else {
          throw new Error('AI geçerli JSON döndürmedi. Lütfen tekrar deneyin.');
        }
      }

      if (!Array.isArray(parsedData)) {
        console.error('[AI-FAQ-GEN] Response is not an array:', typeof parsedData);
        throw new Error('AI array formatında veri döndürmedi.');
      }

      // Validate and clean FAQs
      const validFaqs = parsedData
        .filter(faq => faq.question && faq.answer)
        .map(faq => ({
          question: String(faq.question).trim().replace(/\{service\}/g, serviceTitle),
          answer: String(faq.answer).trim().replace(/\{service\}/g, serviceTitle),
        }))
        .slice(0, 10); // Maximum 10 SSS

      console.log('[AI-FAQ-GEN] Valid FAQs count:', validFaqs.length);
      console.log('[AI-FAQ-GEN] Sample FAQ (first):', validFaqs[0]);
      console.log('[AI-FAQ-GEN] Sample FAQ (last):', validFaqs[validFaqs.length - 1]);
      
      // Check if answers are complete (not truncated)
      validFaqs.forEach((faq, index) => {
        const answerLength = faq.answer.length;
        // Valid endings: punctuation, Turkish letters, or HTML closing tags
        const endsProperlyTurkish = /[.!?]$/.test(faq.answer) 
          || /[a-zğüşıöçA-ZĞÜŞİÖÇ]$/.test(faq.answer)
          || /<\/(p|li|ul|ol|div|strong|em|span)>$/.test(faq.answer.trim());
        if (!endsProperlyTurkish) {
          console.warn(`[AI-FAQ-GEN] FAQ #${index + 1} answer might be truncated (length: ${answerLength}, ends with: "${faq.answer.slice(-20)}")`);
        }
      });

      if (validFaqs.length < 3) {
        console.error('[AI-FAQ-GEN] Insufficient FAQs generated:', validFaqs.length);
        throw new Error(`Yetersiz SSS oluşturuldu (${validFaqs.length}). Lütfen tekrar deneyin.`);
      }

      console.log(`[AI-FAQ-GEN] ✅ Successfully generated ${validFaqs.length} FAQs for "${serviceTitle}"`);

      return ok({ 
        faqs: validFaqs,
        count: validFaqs.length 
      });

    } catch (parseError: any) {
      console.error('[AI-FAQ-GEN] Processing Error:', parseError);
      console.error('[AI-FAQ-GEN] Error stack:', parseError.stack);
      return serverError(`AI yanıtı işlenemedi: ${parseError.message}`);
    }

  } catch (error: unknown) {
    console.error('[AI-FAQ-GEN] General Error:', error);
    if (error instanceof Error) {
      console.error('[AI-FAQ-GEN] Error details:', {
        message: error.message,
        stack: error.stack?.substring(0, 300)
      });
    }
    return serverError(error);
  }
}

export async function OPTIONS() {
  return ok({ ok: true });
}
