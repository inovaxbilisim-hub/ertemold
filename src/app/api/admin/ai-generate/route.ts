import { dbAll } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';
import { generateAiContent } from '@/modules/ai/lib/openrouter';
import { generateGeminiContent } from '@/modules/ai/lib/gemini';
import { getAIConfig } from '@/modules/settings/lib/data-settings';
import { ok, unauthorized, badRequest, serverError } from '@/core/api/response';

function extractJsonObject(raw: string): string | null {
  const cleaned = raw.replace(/```(?:json)?\s?/g, '').replace(/```/g, '').trim();
  const firstOpen = cleaned.indexOf('{');
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
      if (char === '{') balance++;
      if (char === '}') {
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

function repairJsonString(jsonStr: string): string {
  let repaired = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];

    if (char === '"' && !escaped) {
      inString = !inString;
      repaired += char;
      escaped = false;
      continue;
    }

    if (inString) {
      if (char === '\n' || char === '\r') {
        repaired += '\\n';
        escaped = false;
        continue;
      }
      if (char === '\t') {
        repaired += '\\t';
        escaped = false;
        continue;
      }
    }

    repaired += char;
    escaped = char === '\\' && !escaped;
  }

  if (inString) {
    repaired += '"';
  }

  repaired = repaired.replace(/,\s*(?=[}\]])/g, '');

  let openCount = 0;
  let closeCount = 0;
  inString = false;
  escaped = false;

  for (const char of repaired) {
    if (char === '"' && !escaped) {
      inString = !inString;
    }
    if (!inString) {
      if (char === '{') openCount++;
      if (char === '}') closeCount++;
    }
    escaped = char === '\\' && !escaped;
  }

  while (closeCount < openCount) {
    repaired += '}';
    closeCount++;
  }

  return repaired;
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const isBot = url.searchParams.get('bot') === 'ertem-bot-internal';
  const isAuth = isBot || await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const body = await request.json();
    const { title, type, sectors, fields } = body;
    const requestedFields = Array.isArray(fields) ? fields.map(String).filter(Boolean) : [];
    const fieldKeyAliases: Record<string, string> = {
      title: 'title',
      description: 'description',
      long_description: 'long_description',
      longDescription: 'long_description',
      calculator_description: 'calculator_description',
      calculatorDescription: 'calculator_description',
      seo_title: 'seo_title',
      seoTitle: 'seo_title',
      seo_description: 'seo_description',
      seoDescription: 'seo_description',
      features: 'features',
    };
    const canonicalFields = requestedFields
      .map((field) => fieldKeyAliases[field] || '')
      .filter(Boolean);
    const selectedServiceFields = canonicalFields.filter((field) =>
      ['title', 'description', 'long_description', 'calculator_description', 'seo_title', 'seo_description'].includes(field)
    );
    const selectedCategoryFields = canonicalFields.filter((field) =>
      ['description', 'features'].includes(field)
    );
    const fieldLabelMap: Record<string, string> = {
      title: 'Hizmet Başlığı',
      description: 'Kısa Açıklama',
      long_description: 'Uzun Açıklama',
      calculator_description: 'Hesaplayıcı Açıklaması',
      seo_title: 'SEO Başlığı',
      seo_description: 'SEO Açıklaması',
      features: 'Hizmet Özellikleri',
    };
    const selectedFieldLabels = selectedServiceFields.map((field) => fieldLabelMap[field]).filter(Boolean);
    const selectedCategoryFieldLabels = selectedCategoryFields.map((field) => fieldLabelMap[field]).filter(Boolean);

    console.log(`[AI-GEN] Request received: type=${type}, title=${title}, fields=${requestedFields.join(',')}`);

    if (!title || !type) {
      return badRequest('Title and type are required');
    }

    const settings = await getAIConfig();
    
    const provider = settings?.ai_provider;
    if (!provider) {
      return badRequest('AI sağlayıcısı ayarlanmamış. Lütfen Genel Ayarlar > Yapay Zeka sekmesinden sağlayıcı seçin.');
    }

    const apiKey = provider === 'gemini' ? settings?.gemini_api_key : settings?.openrouter_api_key;
    if (!apiKey) {
      return badRequest(`${provider === 'gemini' ? 'Gemini' : 'OpenRouter'} API Key tanımlanmamış. Lütfen Genel Ayarlar > Yapay Zeka sekmesinden API anahtarınızı girin.`);
    }

    // Extra keys for rotation
    const extraGeminiKeys = provider === 'gemini' ? (settings?.gemini_api_keys || []).filter((k: string) => k && k !== apiKey) : [];
    const extraOpenRouterKeys = provider !== 'gemini' ? (settings?.openrouter_api_keys || []).filter((k: string) => k && k !== apiKey) : [];

    const companyName = settings.company_name || 'Firmamız';
    // Validate ai_model: if empty or invalid (like 'openrouter/free'), use empty string to trigger default
    const providerModel = provider === 'gemini' ? (settings.gemini_ai_model || settings.ai_model) : (settings.openrouter_ai_model || settings.ai_model);
    const aiModel = (providerModel && providerModel !== 'openrouter/free' && String(providerModel).includes('/')) 
      ? providerModel 
      : '';

    const sectorSlugs = Array.isArray(sectors)
      ? sectors
          .map((sector: any) => {
            if (typeof sector === 'string') return sector.trim();
            if (sector && typeof sector === 'object') return String(sector.slug || '').trim();
            return '';
          })
          .filter(Boolean)
      : [];

    let prompt = '';
    
    if (type === 'service') {
      const userPrompt = settings.ai_prompt_service ? `${settings.ai_prompt_service}\n\nHizmet Başlığı: "${title}"` : `Sen "${companyName}" firması için çalışan, alanında otorite kabul edilen, üst düzey bir SEO ve AEO (Yapay Zeka Motoru Optimizasyonu) uzmanısın. İçerikleri SEO ve AEO kurallarına göre, kullanıcı niyetini karşılayacak ve arama motorlarında (Google, Perplexity, Claude vb.) üst sıralara çıkacak şekilde hazırlarsın.\nGörev: Aşağıda verilen hizmet başlığı için profesyonel, kurumsal ve tamamen arama motoru/AEO uyumlu açıklama ve uygulama süreç aşamalarını yazman.\nHizmet Başlığı: "${title}"`;
      
      let sectorRules = '';
      if (sectorSlugs.length > 0) {
        const sectorListStr = sectorSlugs.join(', ');
        sectorRules = `\nVeritabanımızda tanımlı olan geçerli sektör slug'ları şunlardır: ${sectorListStr}. Başka sektör adı, eş anlamlı, çoğul veya yeni slug üretme. Sadece bu listedeki slug'ları birebir yaz.`;
      }

      const fieldPriority = selectedFieldLabels.length > 0
        ? `

Hedeflenen alanlar: ${selectedFieldLabels.join(', ')}. Bu alanlara öncelik vererek içerik üret.`
        : '';
      prompt = `${userPrompt}${fieldPriority}${sectorRules}

KURALLAR:
1. Yanıtın KESİNLİKLE geçerli bir JSON formatında olmalı. Başka hiçbir metin (markdown dahil) ekleme.
2. JSON yapısı şu şekilde olmalı:
{
  "short_description": "Hizmet özeti (ServiceForm için).",
  "long_description": "Detaylı metin (ServiceForm için).",
  "subtitle": "Hizmet özeti (TemplateEditor için).",
  "body": "Detaylı metin (TemplateEditor için).",
  "features": ["Özellik 1", "Özellik 2", "Özellik 3"],
  "seo_title": "SEO Başlığı",
  "seo_description": "SEO Açıklaması",
  "meta_title": "SEO Başlığı (Alternatif)",
  "meta_description": "SEO Açıklaması (Alternatif)",
  "timeline_stages": [
    {
      "day": 1,
      "title": "Aşama Başlığı",
      "description": "Aşama açıklaması",
      "icon": "Aşama İkonu (HardHat, Droplets, Layers, Settings, Zap, Sparkles, CheckCircle2 değerlerinden biri olmalı)"
    }
  ],
  "compatible_sectors": ["Sektör Slug 1", "Sektör Slug 2"]
}
3. "timeline_stages" alanı en az 4, en fazla 8 aşama içermelidir. Aşamalardaki "day" alanı sırayla 1'den başlayıp ardışık artmalıdır. "icon" alanı KESİNLİKLE sadece şu listedeki ikon adlarından biri olmalıdır: HardHat, Droplets, Layers, Settings, Zap, Sparkles, CheckCircle2.
4. "compatible_sectors" alanı, bu hizmetin uygulanabileceği sektörlerin slug'larından oluşan bir dizi olmalıdır. ${sectorSlugs.length > 0 ? 'Yalnızca yukarıda verilen veritabanı sektör listesindeki slug değerlerini birebir kullan.' : 'Slug\'lar küçük harf, tire ile ayrılmış ve Türkçe karakter içermeyen formatta olmalıdır (örn: "fabrika", "hastane", "otopark").'} Eğer veritabanında 20 veya daha fazla sektör varsa tam 20 sektör döndür; 20'den azsa mevcut olan tüm uygun sektörleri döndür. Tekrarlı sektör ekleme. Sektör adı yazma, sadece slug döndür.`;
    } else if (type === 'category') {
      const userPrompt = settings.ai_prompt_category ? `${settings.ai_prompt_category}\n\nKategori Başlığı: "${title}"` : `Sen "${companyName}" firması için çalışan, alanında otorite kabul edilen, üst düzey bir SEO ve AEO (Yapay Zeka Motoru Optimizasyonu) uzmanısın. İçerikleri SEO ve AEO kurallarına göre hazırlarsın.\nGörev: Aşağıda verilen hizmet kategorisi için profesyonel, kurumsal ve arama motorlarına/AI botlara tamamen uyumlu bir açıklama yazman.\nKategori Başlığı: "${title}"`;
      const categoryFieldPriority = selectedCategoryFieldLabels.length > 0
        ? `\nHedeflenen alanlar: ${selectedCategoryFieldLabels.join(', ')}. Bu alanlara öncelik vererek kategori açıklamasını hazırla.`
        : '';

      prompt = `${userPrompt}${categoryFieldPriority}\n\nKURALLAR:\n1. Yanıtın KESİNLİKLE geçerli bir JSON formatında olmalı. Başka hiçbir açıklama ekleme.\n2. JSON yapısı şu şekilde olmalı:\n{\n  "description": "Kategori başlığına ve sektöre özel, profesyonel SEO uyumlu açıklama metni.",\n  "features": [\n    "Kategoriyle ilgili 1. spesifik ve teknik özellik",\n    "Kategoriyle ilgili 2. spesifik ve teknik özellik",\n    "Kategoriyle ilgili 3. spesifik ve teknik özellik",\n    "Kategoriyle ilgili 4. spesifik ve teknik özellik",\n    "Kategoriyle ilgili 5. spesifik ve teknik özellik"\n  ]\n}\nÖNEMLİ KURALLAR:\n1. Özellikler (features) KESİNLİKLE kısa ve vurucu olmalı (En fazla 5-7 kelime). Uzun cümlelerden kaçın.\n2. Maddeler 'Kaliteli hizmet', 'Uygun fiyat' gibi genel geçer ifadeler OLMAMALI. \n3. Tamamen kategori başlığındaki teknik detaylara ve avantajlara odaklan. \n4. Açıklama metni (description) kurumsal, güven verici ve maksimum 3-4 cümle olmalı.`;
    } else if (type === 'legal') {
      const userPrompt = settings.ai_prompt_legal ? `${settings.ai_prompt_legal}\n\nSayfa Başlığı: "${title}"` : `Sen "${companyName}" firması için çalışan hukuk ve kurumsal uyum danışmanısın.\nGörev: Aşağıda verilen yasal sayfa başlığı için kapsamlı, profesyonel ve Türkiye mevzuatına (KVKK vb.) uygun bir metin hazırlaman.\nSayfa Başlığı: "${title}"`;

      prompt = `${userPrompt}

ÖNEMLİ KURALLAR:
1. Yanıtın BAŞINDA veya SONUNDA hiçbir açıklama, selamlama veya markdown etiketi OLMAYACAK. 
2. Sadece saf ve geçerli bir JSON objesi döndür.
3. JSON yapısı KESİNLİKLE şu şekilde olmalı:
{
  "content": "Yasal metnin tamamı. HTML etiketleri (p, h3, ul, li, strong) kullanarak yapılandırılmış, resmi ve profesyonel bir dil kullan.",
  "metaTitle": "SEO uyumlu yasal sayfa başlığı",
  "metaDescription": "Sayfa içeriğini özetleyen profesyonel meta açıklaması"
}`;
    } else if (type === 'seo_bulk') {
      const pages = body.pages;
      if (!pages || !Array.isArray(pages)) {
        return badRequest('Pages array is required for bulk SEO');
      }

      const userPrompt = body.prompt || (settings.ai_prompt_seo_master 
        ? `${settings.ai_prompt_seo_master}\n\nŞirket: "${companyName}"`
        : `Sen "${companyName}" firması için çalışan, alanında otorite kabul edilen, üst düzey bir SEO ve AEO (Yapay Zeka Motoru Optimizasyonu) uzmanısın. \nGörevin: Verilen sayfalar için CTR (Tıklama Oranı) yüksek, Arama motoru ve Yapay Zeka botu (AEO) uyumlu Meta Title ve Meta Description oluşturmak.`);

      const pagesList = pages.map(p => `- ${p.label} (anahtar: ${p.key})`).join('\n');
      
      prompt = `${userPrompt}

Aşağıdaki sayfalar için SEO verilerini oluştur:
${pagesList}

KURALLAR:
1. Yanıtın KESİNLİKLE geçerli bir JSON formatında olmalı.
2. Her sayfa anahtarını (key) içeren bir obje döndür.
3. JSON yapısı şu şekilde olmalı:
{
  "page_key_1": {
    "title": "SEO Başlığı",
    "description": "SEO Açıklaması"
  },
  "page_key_2": {
    "title": "SEO Başlığı",
    "description": "SEO Açıklaması"
  }
}`;
    } else if (type === 'about') {
      const userPrompt = `Sen "${companyName}" firması için çalışan, alanında otorite kabul edilen, üst düzey bir SEO ve AEO (Yapay Zeka Motoru Optimizasyonu) uzmanısın.\n         Görevin: Bir "Hakkımızda" sayfası için kurumsal içerikleri (misyon, vizyon, değerler, hikaye) profesyonel bir dille ve markanın otorite sinyallerini (E-E-A-T) artıracak şekilde oluşturmak.`;
         
      prompt = `${userPrompt}

KURALLAR:
1. Yanıtın KESİNLİKLE geçerli bir JSON formatında olmalı.
2. JSON yapısı şu şekilde olmalı:
{
  "badge": "Kurumsal kimliğe uygun kısa bir üst etiket.",
  "title": "Vurucu ve profesyonel bir ana başlık.",
  "subtitle": "Kurumsal özeti destekleyen alt başlık.",
  "descriptionTop": "Şirketin kuruluş felsefesini ve vizyonunu anlatan giriş metni.",
  "storyTitle": "Şirket hikayesi veya tarihçesi için başlık.",
  "descriptionBottom": "Şirketin gelişimini ve bugünkü uzmanlığını anlatan detaylı metin.",
  "experienceLabel": "Deneyim vurgusu (örn: Yıllık Tecrübe).",
  "experienceYears": "Sayısal değer (örn: 10+, 20+ vb.).",
  "missionTitle": "Misyon başlığı.",
  "missionDesc": "Şirketin temel görevini anlatan metin.",
  "visionTitle": "Vizyon başlığı.",
  "visionDesc": "Şirketin gelecek hedeflerini anlatan metin.",
  "valuesTitle": "Değerlerimiz başlığı.",
  "values": [
    {"iconName": "Shield", "title": "Değer Adı", "desc": "Değer açıklaması."}
  ],
  "milestones": [
    {"val": "Sayısal Veri", "label": "Başarı Kriteri"}
  ],
  "servicesTitle": "Hizmetlerimiz Bölüm Başlığı",
  "servicesSubtitle": "Hizmetleri özetleyen kısa cümle.",
  "ctaTitle": "İletişim Başlığı",
  "ctaDesc": "CTA açıklaması.",
  "ctaButtonText": "Buton Metni",
  "meta_title": "Hakkımızda SEO Başlığı",
  "meta_description": "Hakkımızda SEO Açıklaması"
}`;
    } else if (type === 'references') {
      prompt = `Sen "${companyName}" firması için çalışan, alanında otorite kabul edilen, üst düzey bir SEO ve AEO (Yapay Zeka Motoru Optimizasyonu) uzmanısın.\n         Görevin: Bir "Referanslar" sayfası için kurumsal, güven veren, profesyonel ve E-E-A-T (Deneyim, Uzmanlık, Otorite, Güven) sinyallerini maksimize eden içerikler üretmek.
         
         JSON yapısı:
         {
           "badge": "REFERANSLARIMIZ",
           "title": "Güven Dolu Projeler",
           "subtitle": "Çözümlerimizle başarıyla tamamladığımız projeler ve mutlu iş ortaklarımız.",
           "valuesTitle": "Neden Bizimle Çalışmalısınız?",
           "values": [
             {"iconName": "Shield", "title": "Güven", "desc": "Projelerinizde %100 güven ve şeffaflıkla hareket ediyoruz."},
             {"iconName": "Cpu", "title": "İleri Teknoloji", "desc": "En güncel teknik yaklaşımları kullanarak uzun ömürlü çözümler sunuyoruz."},
             {"iconName": "Star", "title": "Uzman Kadro", "desc": "Deneyimli ekibimizle tüm zorlukları aşıyor ve kaliteli sonuçlar üretiyoruz."}
           ],
           "meta_title": "Referanslar ve Başarı Hikayeleri | ${companyName}",
           "meta_description": "Referanslarımız ve tamamladığımız projeler hakkında detaylı bilgi alın."
         }`;
    } else if (type === 'contact') {
      prompt = `Sen "${companyName}" firması için çalışan, alanında otorite kabul edilen, üst düzey bir SEO ve AEO (Yapay Zeka Motoru Optimizasyonu) uzmanısın.\n         Görevin: Bir "İletişim" sayfası için profesyonel, yardımsever, güven veren ve dönüşüm oranını (CRO) artıracak bir karşılama dili oluşturmak.
         
         JSON yapısı:
         {
           "badge": "İLETİŞİM",
           "title": "Çözümlerimiz İçin Bize Ulaşın",
           "subtitle": "Projelerinizle ilgili teknik destek veya fiyat teklifi almak için uzman ekibimizle iletişime geçebilirsiniz.",
           "meta_title": "İletişim | ${companyName} - Destek Hattı",
           "meta_description": "${companyName} iletişim bilgileri. Hizmetlerimiz için hemen teklif alın."
         }`;
    } else if (type === 'home') {
      prompt = `Sen "${companyName}" firması için çalışan, alanında otorite kabul edilen, üst düzey bir SEO ve AEO (Yapay Zeka Motoru Optimizasyonu) uzmanısın.\n         Görevin: Ana sayfanın en üstünde yer alan "Hero" (karşılama) bölümü için etkileyici, modern, arama motorlarında markayı güçlendiren ve dönüşüm odaklı içerikler üretmek.
         
         JSON yapısı:
         {
           "hero": {
             "badge": "Şirket sloganı veya kısa vurgu (maks 3 kelime).",
             "title": "Ana sayfa karşılama başlığı (çarpıcı ve büyük).",
             "description": "Şirketi ve temel değerini anlatan 2-3 cümlelik giriş metni.",
             "ctaText": "Birincil buton metni (örn: Hizmetlerimizi Keşfedin)",
             "ctaSecondaryText": "İkincil buton metni (örn: Bize Ulaşın)"
           },
           "meta_title": "Ana sayfa SEO başlığı",
           "meta_description": "Ana sayfa SEO açıklaması"
         }`;
    } else if (type === 'geo') {
      const services = await dbAll<any>("SELECT title FROM services WHERE active = true LIMIT 30");
      const categories = await dbAll<any>("SELECT name FROM service_categories");
      
      const serviceContext = services.map(s => s.title).join(', ') || 'Hizmetler henüz eklenmemiş';
      const categoryContext = categories.map(c => c.name).join(', ') || 'Kategoriler henüz eklenmemiş';

      prompt = `GÖREV: Aşağıdaki şirket bilgilerini kullanarak GEO (Generative Engine Optimization) ve E-E-A-T (Deneyim, Uzmanlık, Otorite, Güven) sinyallerini güçlendirecek bir yapılandırma JSON'ı hazırla.

ŞİRKET: ${companyName}
HİZMETLER: ${serviceContext}
KATEGORİLER: ${categoryContext}

YANIT FORMATI (KESİNLİKLE SADECE JSON):
{
  "geo_know_about": "Şirketin uzman olduğu teknik konular, hizmetler ve anahtar kelimeler (virgülle ayrılmış uzun bir liste).",
  "geo_prompt_summary": "Yapay zeka modellerine (GPT, Claude vb.) bu siteyi nasıl özetlemeleri gerektiğini söyleyen profesyonel bir talimat metni.",
  "geo_prompt_faq": "Yapay zeka modellerine, hizmetlerle ilgili nasıl Sıkça Sorulan Sorular (FAQ) üretmeleri gerektiğini söyleyen teknik talimat.",
  "geo_publishing_principles": "Sitenin içerik üretiminde takip ettiği şeffaflık, doğruluk ve uzmanlık ilkelerini özetleyen metin.",
  "geo_org_same_as": ["https://www.linkedin.com/company/ornek", "https://twitter.com/ornek"],
  "geo_founder_name": "Şirketin kurucusu veya baş uzmanının adı.",
  "geo_founder_same_as": "Kurucunun LinkedIn veya profesyonel profil linki."
}

DİKKAT:
- Sadece JSON döndür. 
- Markdown ( \`\`\`json ) kullanma.
- Alanları dolu ve profesyonel içerikle hazırla.`;

    } else if (type === 'pseo_sector') {
      const activeServices = await dbAll<Record<string, any>>(`SELECT id, title FROM services WHERE active = true`);
      const servicesListStr = activeServices.map(s => `- ID: ${s.id} | Başlık: ${s.title}`).join('\\n');

      const userPrompt = settings.ai_prompt_sector_description && settings.ai_prompt_sector_description.trim() !== ''
        ? settings.ai_prompt_sector_description
        : `Sen "${companyName}" firması için çalışan, alanında otorite kabul edilen, üst düzey bir SEO ve AEO uzmanısın.\\nGörevin: Verilen bir iş sektörü için pSEO motorunda kullanılacak ve hem klasik arama motoru botları (Google) hem de LLM botları için semantik olarak en uygun teknik terimleri üretmek.\\n\\nSektör: "{{sectorName}}"`;

      const basePrompt = userPrompt
        .replace(/\{\{companyName\}\}/g, companyName || '')
        .replace(/\{\{sectorName\}\}/g, title || '')
        .replace(/\{\{servicesList\}\}/g, servicesListStr || '');

      const userJsonSchema = settings.ai_prompt_sector_json && settings.ai_prompt_sector_json.trim() !== ''
        ? settings.ai_prompt_sector_json
            .replace(/\{\{companyName\}\}/g, companyName || '')
            .replace(/\{\{sectorName\}\}/g, title || '')
            .replace(/\{\{servicesList\}\}/g, servicesListStr || '')
        : `{
  "description": "<h2>...</h2><p>800+ karakterlik detaylı HTML metin...</p>",
  "hero_description": "Sektöre özel 1-2 cümlelik kısa özet.",
  "seo_title": "SEO Başlığı",
  "seo_description": "SEO Açıklaması",
  "recommended_service_ids": [1, 2],
  "action_verb": "Kaplama",
  "service_suffix": "Sistemleri",
  "value_prop": "Hijyenik Standartlarda"
}`;

      prompt = `${basePrompt}\\n\\nLütfen sadece aşağıdaki yapıda geçerli bir JSON dön:\\n${userJsonSchema}\\n\\nNot: JSON dışında hiçbir metin, markdown (json) bloğu veya açıklama yazma. Doğrudan JSON döndür.`;
    } else if (type === 'reference_content') {
      prompt = `Sen "${companyName}" firması için çalışan, alanında otorite kabul edilen, üst düzey bir SEO ve Endüstriyel Zemin/Yalıtım uzmanısın.\n         Görevin: Verilen proje verilerini (sektör, metrekare, notlar) kullanarak profesyonel bir vaka analizi (case study) ve teknik detaylar tablosu oluşturmak.
      
      PROJE VERİLERİ (DONELER):
      ${title}

      KURALLAR:
      1. Yanıtın KESİNLİKLE geçerli bir JSON formatında olmalı.
      2. JSON yapısı şu şekilde olmalı:
      {
        "projectSummary": "Projenin kapsamını ve sonucunu anlatan 2 cümlelik profesyonel bir özet metni.",
        "description": "Projenin başlangıcından bitişine kadar yapılan uygulamaları anlatan SEO uyumlu uzun detaylı metin.",
        "features": ["Uygulanan işlem 1", "Uygulanan işlem 2", "Uygulanan işlem 3"],
        "challenge": "Müşterinin yaşadığı temel sorun veya sahadaki zorluk (Profesyonel bir dille).",
        "solution": "Firmamızın bu zorluğa karşı uyguladığı teknik çözüm ve sağladığı fayda.",
        "system_type": "Proje için en uygun sistem (epoxy_coating, polyurethane, self_leveling, industrial_floor, decorative değerlerinden biri olmalı).",
        "application_type": "En uygun uygulama tipi (industrial, commercial, decorative, warehouse, parking değerlerinden biri olmalı).",
        "forklift_traffic": "Projenin sektörüne göre trafik tahmini (none, light, medium, heavy değerlerinden biri olmalı).",
        "concrete_type": "Uygun zemin beton tipi (Örn: C25/30, C30/37 veya Saha Betonu).",
        "coating_thickness_mm": 2.5,
        "coverage_rate_sqm_kg": 4.5,
        "curing_time_hours": 24
      }
      Not: Sayısal alanları (coating_thickness_mm, coverage_rate_sqm_kg, curing_time_hours) number olarak gönder.`;
    } else {
      return badRequest('Invalid type');
    }

    let aiRes;
    try {
      if (provider === 'gemini') {
        aiRes = await generateGeminiContent(prompt, apiKey, aiModel, extraGeminiKeys);
      } else {
        aiRes = await generateAiContent(prompt, apiKey, aiModel, extraOpenRouterKeys);
      }
    } catch (providerError: any) {
      console.error('[AI-GEN] Provider Error:', providerError);
      return serverError(`Yapay zeka sağlayıcı hatası: ${providerError.message || String(providerError)}`);
    }
    
    try {
      let jsonStr = aiRes.content.trim();
      
      // İlk olarak markdown kod bloklarını temizle
      jsonStr = jsonStr.replace(/```json\s?/g, '').replace(/```\s?/g, '').trim();
      
      // JSON bloğunu bul: İlk { karakterinden itibaren parantez sayarak objeyi ayıkla
      const firstOpen = jsonStr.indexOf('{');
      if (firstOpen !== -1) {
        let balance = 0;
        let lastClose = -1;
        let inString = false;
        let escaped = false;

        for (let i = firstOpen; i < jsonStr.length; i++) {
          const char = jsonStr[i];
          
          if (char === '"' && !escaped) {
            inString = !inString;
          }
          
          if (!inString) {
            if (char === '{') balance++;
            if (char === '}') {
              balance--;
              if (balance === 0) {
                lastClose = i;
                break;
              }
            }
          }
          
          escaped = char === '\\' && !escaped;
        }

        if (lastClose !== -1) {
          jsonStr = jsonStr.substring(firstOpen, lastClose + 1);
        }
      }
      
      if (!jsonStr || !jsonStr.startsWith('{')) {
        if (type === 'geo') {
          return ok({ geo_know_about: aiRes.content });
        }
        throw new Error('AI geçerli bir JSON yapısı oluşturamadı.');
      }

      let parsedData;
      const extractedJson = extractJsonObject(jsonStr) || jsonStr;
      try {
        parsedData = JSON.parse(extractedJson);
      } catch (firstError) {
        console.warn('AI JSON ilk ayrıştırma hatası:', firstError, 'extracted:', extractedJson);
        const repaired = repairJsonString(extractedJson);
        try {
          parsedData = JSON.parse(repaired);
          console.warn('AI JSON onarım başarılı.');
        } catch (secondError) {
          console.warn('AI JSON onarım hatası:', secondError, 'repaired:', repaired);
          throw new Error('AI yanıtı geçerli JSON olarak ayrıştırılamadı. Lütfen tekrar deneyin.');
        }
      }
      
      // -- KEY NORMALIZATION LAYER --
      // Ensure all possible keys are populated regardless of AI output or type
      const normalizedData: any = {
        ...parsedData,
        // Content Keys
        projectSummary: parsedData.projectSummary || "",
        short_description: String(parsedData.short_description || parsedData.projectSummary || parsedData.subtitle || (parsedData.description?.substring(0, 200)) || ""),
        long_description: String(parsedData.long_description || parsedData.content || parsedData.body || parsedData.longDescription || ""),
        content: String(parsedData.content || parsedData.long_description || parsedData.body || ""),
        body: String(parsedData.body || parsedData.content || parsedData.long_description || parsedData.longDescription || ""),
        subtitle: String(parsedData.subtitle || parsedData.projectSummary || parsedData.short_description || parsedData.description || ""),
        description: String(parsedData.description || parsedData.long_description || parsedData.content || parsedData.short_description || ""),
        badge: String(parsedData.badge || parsedData.tag || parsedData.category || "Hizmet"),
        
        // SEO normalization (Crucial for Legal/Service/Category/SEO tabs)
        seo_title: parsedData.seo_title || parsedData.meta_title || parsedData.seoTitle || parsedData.metaTitle || title,
        seo_description: parsedData.seo_description || parsedData.meta_description || parsedData.seoDescription || parsedData.metaDescription || "",
        meta_title: parsedData.meta_title || parsedData.seo_title || parsedData.metaTitle || parsedData.seoTitle || title,
        meta_description: parsedData.meta_description || parsedData.seo_description || parsedData.metaDescription || parsedData.seoDescription || "",
        seoTitle: parsedData.seoTitle || parsedData.seo_title || parsedData.metaTitle || parsedData.meta_title || title,
        seoDescription: parsedData.seoDescription || parsedData.seo_description || parsedData.metaDescription || parsedData.meta_description || "",
        metaTitle: parsedData.metaTitle || parsedData.meta_title || parsedData.seoTitle || parsedData.seo_title || title,
        metaDescription: parsedData.metaDescription || parsedData.meta_description || parsedData.seoDescription || parsedData.seo_description || "",

        // Reference AI Technical & SEO Fields
        system_type: parsedData.system_type || "",
        application_type: parsedData.application_type || "",
        forklift_traffic: parsedData.forklift_traffic || "",
        concrete_type: parsedData.concrete_type || "",
        coating_thickness_mm: parsedData.coating_thickness_mm ? Number(parsedData.coating_thickness_mm) : null,
        coverage_rate_sqm_kg: parsedData.coverage_rate_sqm_kg ? Number(parsedData.coverage_rate_sqm_kg) : null,
        curing_time_hours: parsedData.curing_time_hours ? Number(parsedData.curing_time_hours) : null,
        challenge: parsedData.challenge || "",
        solution: parsedData.solution || "",

        // Specialized fields
        features: Array.isArray(parsedData.features) 
          ? parsedData.features 
          : (typeof parsedData.features === 'string' ? parsedData.features.split(',').map((s: string) => s.trim()) : []),
        references: Array.isArray(parsedData.references) ? parsedData.references : [],
        items: Array.isArray(parsedData.items) ? parsedData.items : [],
        timeline_stages: Array.isArray(parsedData.timeline_stages) ? parsedData.timeline_stages : [],
        compatible_sectors: Array.isArray(parsedData.compatible_sectors) ? parsedData.compatible_sectors : [],
        recommended_service_ids: Array.isArray(parsedData.recommended_service_ids) ? parsedData.recommended_service_ids : [],
        hero_description: parsedData.hero_description || "",
        action_verb: parsedData.action_verb || "",
        service_suffix: parsedData.service_suffix || "",
        value_prop: parsedData.value_prop || ""
      };

      console.log(`[AI-GEN] Normalized data for "${title}" (${type})`);

      // Type-specific adjustments for GEO
      if (type === 'geo') {
        normalizedData.geo_know_about = parsedData.geo_know_about || parsedData.content || parsedData.long_description || "";
        normalizedData.geo_prompt_summary = parsedData.geo_prompt_summary || (normalizedData.geo_know_about?.substring(0, 500)) || "";
        normalizedData.geo_prompt_faq = Array.isArray(parsedData.geo_prompt_faq) ? JSON.stringify(parsedData.geo_prompt_faq) : (parsedData.geo_prompt_faq || "[]");
      }

      return ok(normalizedData);
    } catch (parseError: any) {
      console.error('AI Processing Error:', parseError);
      console.error('Raw AI Response:', aiRes?.content);
      return serverError(`Yapay zeka yanıtı işlenemedi (Geçersiz JSON). Lütfen tekrar deneyin.`);
    }

  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function OPTIONS() {
  return ok({ ok: true });
}
