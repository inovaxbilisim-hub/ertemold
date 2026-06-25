const { dbRun, dbGet } = require('./src/core/database/db');

async function updatePrompts() {
  const prompt = `Görevin: "{{companyName}}" firması için pSEO motorunda kullanılacak içerikleri üretmek. 
Sektör: "{{sectorName}}"
  
Sistemimizde bulunan aktif hizmetler (ID ve Başlık):
{{servicesList}}

ZORUNLU TALİMATLAR:
1. "description" metni ÇOK DETAYLI olmalı ve KESİNLİKLE EN AZ 800 KARAKTER uzunluğunda olmalıdır. Kısa yazma! Bu sektör için hangi zemin/yalıtım hizmetinin NEDEN kritik olduğunu detaylıca anlat.
2. "description" metni HTML formatında olmalı (<h2>, <h3>, <p>, <ul> gibi etiketler içermelidir).
3. "hero_description" alanına sektörün 1-2 cümlelik çok kısa özetini yaz.
4. "seo_title" (maks 60 karakter) ve "seo_description" (150-160 karakter civarı) alanlarını eksiksiz üret.
5. "recommended_service_ids" alanına, yukarıdaki hizmet listesinden bu sektöre en uygun olanların ID (tam sayı) değerlerini dizi (array) olarak ekle. Sadece listede var olan ID'leri kullan, asla uydurma!
6. "action_verb": Bu sektördeki uygulama için teknik bir eylem adı (Örn: Kaplama, Uygulama).
7. "service_suffix": Hizmet başlığının sonuna gelecek sektörel tamlama (Örn: Çözümleri, Sistemleri).
8. "value_prop": Sektöre özel bir değer önerisi (Örn: Hijyenik Standartlarda, Ağır Yüke Dayanıklı).`;

  const jsonSchema = `{
  "description": "<h2>...</h2><p>800+ karakterlik detaylı HTML metin...</p>",
  "hero_description": "Sektöre özel 1-2 cümlelik kısa özet.",
  "seo_title": "SEO Başlığı",
  "seo_description": "SEO Açıklaması",
  "recommended_service_ids": [1, 2],
  "action_verb": "Kaplama",
  "service_suffix": "Sistemleri",
  "value_prop": "Hijyenik Standartlarda"
}`;

  try {
    // Check if site_settings exists
    const settings = await dbGet('SELECT ai_config FROM site_settings LIMIT 1');
    if (settings && settings.ai_config) {
      let config = JSON.parse(settings.ai_config);
      config.ai_prompt_sector_description = prompt;
      config.ai_prompt_sector_json = jsonSchema;
      await dbRun('UPDATE site_settings SET ai_config = $1', [JSON.stringify(config)]);
      console.log('Successfully updated AI prompts in site_settings.');
    } else {
      console.log('No site_settings found.');
    }
  } catch (err) {
    console.error('Error updating settings:', err);
  }
}

updatePrompts();
