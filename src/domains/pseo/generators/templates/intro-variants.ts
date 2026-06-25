/**
 * 24 pSEO intro varyantı — mevcut pseo-utils.ts:217-242 ile birebir aynı.
 * Deterministik seed-based seçim ile hangi varyantın kullanılacağı belirlenir.
 *
 * NOT: Placeholder'lar {değişken} formatındadır.
 * renderIntroVariant() fonksiyonu ile doldurulurlar.
 */

/**
 * 24 intro varyant template string'i.
 * {varName} placeholder'ları renderIntroVariant ile doldurulur.
 */
export const introVariants: string[] = [
  // 0
  '{locationDisplayName} {locationSuffix} bölgesinde {labelPrefix}{serviceTitle} {serviceSuffix} için sahada keşif, proje analizi ve uygulama desteği sunuyoruz.',
  // 1
  '{labelPrefix}{serviceTitle} ile {locationDisplayName} bölgesinde güvenilir ve ölçülebilir çözümler sağlıyoruz.',
  // 2
  '{locationDisplayName} genelinde, {actionVerb} yaklaşımıyla {serviceTitle} {serviceSuffix} sağlıyoruz.',
  // 3
  '{locationDisplayName} {locationSuffix} alanında {labelPrefix}{serviceTitle} konusunda teknik uzmanlık ve saha deneyimi sunuyoruz.',
  // 4
  '{serviceTitle} {serviceSuffix} için {locationDisplayName} bölgesinde yerinde değerlendirme ve kapsamlı çözüm paketi hazırlıyoruz.',
  // 5
  '{locationDisplayName} bölgesindeki {labelPrefix}{serviceTitle} ihtiyaçlarınıza; teknik keşif, analiz ve kaliteli uygulama ile yanıt veriyoruz.',
  // 6
  '{locationDisplayName} {locationSuffix} bölgesinde endüstriyel tesisleriniz için {labelPrefix}{serviceTitle} uygulamalarında uzman kadromuzla hizmet veriyoruz.',
  // 7
  '{cityDisplayName || locationDisplayName} ve çevresinde {labelPrefix}{serviceTitle} alanında 10 yılı aşkın tecrübemizle güvenilir çözüm ortağınızız.',
  // 8
  '{locationDisplayName} bölgesinde faaliyet gösteren işletmelere yönelik {labelPrefix}{serviceTitle} çözümlerimizle üretim kalitenizi artırın.',
  // 9
  '{serviceTitle} {serviceSuffix} konusunda {locationDisplayName} {locationSuffix} bölgesinde referans projelerimizle öne çıkıyoruz.',
  // 10
  '{locationDisplayName} {locationSuffix} bölgesinde {labelPrefix}{serviceTitle} ihtiyacınızda profesyonel ekip, kaliteli malzeme ve zamanında teslimat garantisi sunuyoruz.',
  // 11
  'Sanayi tesisleriniz için {locationDisplayName} {locationSuffix} bölgesinde {labelPrefix}{serviceTitle} çözümlerimizle iş sürekliliğinizi koruyoruz.',
  // 12
  '{locationDisplayName} genelinde {labelPrefix}{serviceTitle} alanında anahtar teslim çözümler, düzenli bakım ve teknik danışmanlık hizmetleri sağlıyoruz.',
  // 13
  '{locationDisplayName} {locationSuffix} bölgesinde {labelPrefix}{serviceTitle} ile ilgili tüm sorularınıza uzman ekibimizle yanıt veriyor, yerinde keşif ve analiz hizmeti sunuyoruz.',
  // 14
  'Yıllardır {cityDisplayName || locationDisplayName} ve çevre ilçelerde {labelPrefix}{serviceTitle} alanında edindiğimiz deneyimle en doğru çözümü sunuyoruz.',
  // 15
  '{locationDisplayName} {locationSuffix} bölgesindeki depo, fabrika ve otoparklarınızda {labelPrefix}{serviceTitle} uygulamasıyla hijyenik ve dayanıklı yüzeyler elde edin.',
  // 16
  '{serviceTitle} için {locationDisplayName} bölgesinde çağdaş teknolojiler ve kaliteli işçilikle fark yaratıyoruz.',
  // 17
  '{locationDisplayName} {locationSuffix} bölgesinde faaliyet gösteren firmalar için {labelPrefix}{serviceTitle} hizmetlerimizle işletme verimliliğinizi artırıyoruz.',
  // 18
  'Uzman ekibimiz {locationDisplayName} {locationSuffix} bölgesinde {labelPrefix}{serviceTitle} uygulamalarında size en uygun malzeme ve yöntemi belirlemek için ücretsiz keşif yapıyor.',
  // 19
  '{locationDisplayName} {locationSuffix} bölgesinde {labelPrefix}{serviceTitle} taleplerinizde hızlı keşif, rekabetçi fiyat ve uzun ömürlü çözümler sunuyoruz.',
  // 20
  '{serviceTitle} alanında {locationDisplayName} {locationSuffix} bölgesinde binlerce metrekare uygulama deneyimiyle yanınızdayız.',
  // 21
  '{cityDisplayName || locationDisplayName} ve ilçelerinde {labelPrefix}{serviceTitle} konusunda referans projelerimizle güvenilir çözüm ortağınız olmaya devam ediyoruz.',
  // 22
  '{locationDisplayName} {locationSuffix} bölgesinde {labelPrefix}{serviceTitle} arıyorsanız; doğru adrestesiniz. Profesyonel yaklaşım, kaliteli malzeme ve uygun fiyat garantisi veriyoruz.',
  // 23
  '{locationDisplayName} bölgesindeki {labelPrefix}{serviceTitle} ihtiyaçlarınızda size özel çözümler, esnek fiyatlandırma ve garanti desteği sağlıyoruz.',
];

export const INTRO_VARIANTS_COUNT = 24;

/**
 * Seed-based deterministik varyant seçici.
 * Aynı input her zaman aynı varyantı döndürür.
 */
export function getIntroVariantIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % INTRO_VARIANTS_COUNT;
}

type IntroPlaceholders = {
  locationDisplayName: string;
  cityDisplayName: string | null;
  serviceTitle: string;
  labelPrefix: string;
  locationSuffix: string;
  serviceSuffix: string;
  actionVerb: string;
};

export function renderIntroVariantFromText(
  template: string,
  params: IntroPlaceholders,
): string {
  const {
    locationDisplayName,
    cityDisplayName,
    serviceTitle,
    labelPrefix,
    locationSuffix,
    serviceSuffix,
    actionVerb,
  } = params;

  return template
    .replace(/\{locationDisplayName\}/g, locationDisplayName)
    .replace(
      /\{cityDisplayName \|\| locationDisplayName\}/g,
      cityDisplayName || locationDisplayName,
    )
    .replace(/\{cityDisplayName\}/g, cityDisplayName || '')
    .replace(/\{serviceTitle\}/g, serviceTitle)
    .replace(/\{labelPrefix\}/g, labelPrefix)
    .replace(/\{locationSuffix\}/g, locationSuffix)
    .replace(/\{serviceSuffix\}/g, serviceSuffix)
    .replace(/\{actionVerb\}/g, actionVerb);
}

/**
 * Template değişkenlerini doldurarak intro metni üretir.
 * {placeholder} formatındaki değişkenleri parametre değerleriyle değiştirir.
 */
export function renderIntroVariant(
  index: number,
  params: IntroPlaceholders,
): string {
  const template = introVariants[index];
  if (!template) return introVariants[0];
  return renderIntroVariantFromText(template, params);
}
