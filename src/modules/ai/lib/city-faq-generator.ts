/**
 * City-Specific FAQ Generator
 * Generates unique FAQs for each city based on real data
 */

import { generateGeminiContent } from './gemini';
import { generateAiContent } from './openrouter';
import type { SiteSettings } from '@/core/types';

export interface CityContext {
  cityName: string;
  citySlug: string;
  serviceName: string;
  serviceDescription?: string;
  // Real data
  totalProjects?: number;
  totalSqm?: number;
  references?: Array<{ name: string; sector: string }>;
  // Location metadata
  climate?: {
    maxTempSummer: number;
    minTempWinter: number;
    humidityGroup: string;
  };
  osb?: string[];
  dominantSectors?: string[];
}

export interface CityFAQ {
  question: string;
  answer: string;
  category: 'location' | 'technical' | 'pricing' | 'timeline';
}

/**
 * Build city-specific FAQ generation prompt
 */
function buildCityFAQPrompt(context: CityContext, settings: SiteSettings | null): string {
  const { cityName, serviceName, serviceDescription, totalProjects, references, climate, osb, dominantSectors } = context;
  const companyName = (settings as any)?.company_name || 'Firmamız';

  // Build context from real data
  const contextParts: string[] = [];
  
  if (totalProjects && totalProjects > 0) {
    contextParts.push(`- ${cityName}'da ${totalProjects} adet ${serviceName} projesi tamamladık`);
  }
  
  if (references && references.length > 0) {
    const sectors = Array.from(new Set(references.map(r => r.sector))).join(', ');
    contextParts.push(`- Referans sektörler: ${sectors}`);
  }
  
  if (climate) {
    const humidityText = climate.humidityGroup === 'HIGH' ? 'yüksek nem' 
      : climate.humidityGroup === 'LOW' ? 'düşük nem' 
      : 'orta nem';
    contextParts.push(`- İklim: Yaz ${climate.maxTempSummer}°C, Kış ${climate.minTempWinter}°C, ${humidityText}`);
  }
  
  if (osb && osb.length > 0) {
    contextParts.push(`- Organize Sanayi Bölgeleri: ${osb.slice(0, 3).join(', ')}`);
  }
  
  if (dominantSectors && dominantSectors.length > 0) {
    contextParts.push(`- Dominant sektörler: ${dominantSectors.join(', ')}`);
  }

  const contextText = contextParts.length > 0 
    ? contextParts.join('\n') 
    : `${cityName} bölgesinde ${serviceName} hizmetleri sunuyoruz.`;

  return `Sen "${companyName}" firması için çalışan, ${cityName} bölgesini çok iyi tanıyan yerel bir zemin kaplama uzmanısın.

GÖREV: ${cityName} için ${serviceName} hizmetine özel, ŞEHİR ODAKLI 5 adet UNIQUE SSS oluştur.

HİZMET: ${serviceName}
${serviceDescription ? `Açıklama: ${serviceDescription}` : ''}

${cityName.toUpperCase()} ÖZEL BİLGİLER:
${contextText}

KRITIK KURALLAR:
1. ✅ Her soru MUTLAKA ${cityName} adını içermeli
2. ✅ Gerçek verilerden yararlan (proje sayısı, iklim, OSB, sektörler)
3. ✅ Diğer şehirlerden FARKLI sorular sor
4. ✅ Yerel zorlukları/çözümleri vurgula
5. ❌ Generic sorular YASAK

SORU KATEGORİLERİ (Her kategoriden en az 1):
- **Lokasyon:** "${cityName}'da nereye hizmet veriyorsunuz?", "${cityName} OSB'lerde çalışıyor musunuz?"
- **Teknik:** "${cityName}'nın iklimi ${serviceName} için uygun mu?", "Nem/sıcaklık şartları nasıl etkilenir?"
- **Deneyim:** "${cityName}'da hangi sektörlerde çalıştınız?", "Referans projeleriniz var mı?"
- **Süreç:** "${cityName}'a ne kadar sürede gelirsiniz?", "Keşif ücreti var mı?"

YANIT FORMATI (SADECE JSON):
[
  {
    "question": "${cityName} özel soru (mutlaka şehir adı geçmeli)",
    "answer": "<p>Detaylı, şehre özel cevap. ${cityName} adı geçmeli. <strong>Önemli vurgular</strong>.</p>",
    "category": "location"
  }
]

ÖNEMLİ: Sadece [ ile başlayıp ] ile biten JSON array döndür. Başka hiçbir metin ekleme!`;
}

/**
 * Generate city-specific FAQs using AI
 */
export async function generateCityFAQs(
  context: CityContext,
  settings: SiteSettings | null
): Promise<CityFAQ[]> {
  if (!settings?.ai_provider) {
    throw new Error('AI provider not configured');
  }

  const prompt = buildCityFAQPrompt(context, settings);
  
  const apiKey = settings.ai_provider === 'gemini' 
    ? settings.gemini_api_key 
    : settings.openrouter_api_key;
    
  if (!apiKey) {
    throw new Error(`${settings.ai_provider} API key not found`);
  }

  const extraGeminiKeys = settings.ai_provider === 'gemini' 
    ? (settings.gemini_api_keys || []).filter(k => k && k !== apiKey)
    : [];

  const aiModel = (settings.ai_model && settings.ai_model !== 'openrouter/free' && String(settings.ai_model).includes('/')) 
    ? settings.ai_model 
    : '';

  let aiRes;
  if (settings.ai_provider === 'gemini') {
    aiRes = await generateGeminiContent(prompt, apiKey, aiModel, extraGeminiKeys);
  } else {
    aiRes = await generateAiContent(prompt, apiKey, aiModel);
  }

  // Parse JSON response
  let jsonStr = aiRes.content.trim();
  jsonStr = jsonStr.replace(/```json\s?/g, '').replace(/```\s?/g, '').trim();
  
  // Extract JSON array
  const firstOpen = jsonStr.indexOf('[');
  const lastClose = jsonStr.lastIndexOf(']');
  if (firstOpen !== -1 && lastClose !== -1) {
    jsonStr = jsonStr.substring(firstOpen, lastClose + 1);
  }

  let faqs: CityFAQ[];
  try {
    faqs = JSON.parse(jsonStr) as CityFAQ[];
  } catch {
    console.log('[CityFAQ] JSON parse failed, trying fallback HTML parser...');
    // Simple fallback: extract <p> blocks and pair with preceding questions
    const htmlBlocks = jsonStr.match(/<p>[\s\S]*?<\/p>/g) || [];
    const lines = jsonStr.split('\n').map(l => l.trim()).filter(Boolean);
    const questions = lines.filter(l => l.includes('?') && !l.startsWith('<'));
    if (htmlBlocks.length >= 1 && questions.length >= 1) {
      const count = Math.min(questions.length, htmlBlocks.length);
      faqs = questions.slice(0, count).map((q, i) => ({
        question: q.replace(/^\d+[\.\)]\s*/, '').trim(),
        answer: htmlBlocks[i],
        category: 'location' as const,
      }));
    } else {
      faqs = [];
    }
  }
  
  // Validate and filter
  return faqs
    .filter(faq => 
      faq.question && 
      faq.answer && 
      faq.question.toLowerCase().includes(context.cityName.toLowerCase())
    )
    .slice(0, 5);
}

/**
 * Check if we should regenerate city FAQs
 * Regenerate if:
 * - No FAQs exist for this city+service combo
 * - FAQs are generic (don't mention city name)
 * - FAQs are older than 30 days
 */
function shouldRegenerateCityFAQs(
  existingFaqs: any[],
  cityName: string,
  lastGenerated?: Date
): boolean {
  // No FAQs exist
  if (!existingFaqs || existingFaqs.length === 0) {
    return true;
  }

  // FAQs don't mention city (generic)
  const mentionsCity = existingFaqs.some(faq => 
    faq.question?.toLowerCase().includes(cityName.toLowerCase())
  );
  if (!mentionsCity) {
    return true;
  }

  // FAQs are old (30+ days)
  if (lastGenerated) {
    const daysSince = (Date.now() - lastGenerated.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 30) {
      return true;
    }
  }

  return false;
}
