/**
 * 24 pSEO fayda maddesi varyantı.
 * Mevcut pseo-utils.ts:253-278 ile birebir aynı.
 */

export const benefitLines: string[] = [
  `{locationDisplayName} bölgesindeki işlerinizde hızlı dönüş, kaliteli işçilik ve yerinde destek sağlıyoruz.`,
  `{actionVerb} odaklı çözümlerimizle; doğru malzeme seçimi, saha raporu ve detaylı uygulama planı sunuyoruz.`,
  `Teknik kontrol, işçilik garantisi ve müşteri memnuniyeti önceliğimizle çalışıyoruz.`,
  `{locationDisplayName} genelinde uzman ekibimizle hızlı keşif, şeffaf fiyatlandırma ve garantili uygulama sunuyoruz.`,
  `Yerinde saha analizi ve proje bazlı planlama ile {locationDisplayName} bölgesine özel çözümler geliştiriyoruz.`,
  `{serviceTitle} alanındaki derin teknik bilgimiz ve {locationDisplayName} bölgesindeki deneyimimizle fark yaratıyoruz.`,
  `{cityDisplayName || locationDisplayName} bölgesinde rakiplerimizden ayrılan kaliteli işçilik ve malzeme standardımızla öne çıkıyoruz.`,
  `Müşteri odaklı yaklaşımımız sayesinde {locationDisplayName} genelinde memnuniyet oranı yüksek projelere imza atıyoruz.`,
  `{locationDisplayName} bölgesinde {serviceTitle} alanında kullandığımız son teknoloji ekipmanlarla kusursuz yüzey kalitesi elde ediyoruz.`,
  `Proje teslim tarihine %100 uyum ve uygulama sonrası teknik destek ile {locationDisplayName} müşterilerimize güven veriyoruz.`,
  `{locationDisplayName} bölgesinde işletmenizin duruş süresini minimize edecek şekilde planlanmış uygulama takvimi sunuyoruz.`,
  `İhtiyaca özel malzeme seçimi, uzman ekip ve kalite kontrol süreçlerimizle {locationDisplayName} bölgesinde fark yaratıyoruz.`,
  `{locationDisplayName} müşterilerimize uygulama sonrası düzenli bakım ve periyodik kontrol hizmetleri de sağlıyoruz.`,
  `Bütçenize uygun çözüm alternatifleri sunarak {locationDisplayName} bölgesinde şeffaf ve güvenilir bir hizmet deneyimi yaşatıyoruz.`,
  `{locationDisplayName} genelinde tamamladığımız yüzlerce projeyle kanıtlanmış uzmanlığımızı sizin işinizde de konuşlandırıyoruz.`,
  `Tesisinizin özel koşullarını değerlendiriyor, {locationDisplayName} iklim ve çevre şartlarına uygun malzeme ve yöntem öneriyoruz.`,
  `Eğitimli ve deneyimli saha ekiplerimizle {locationDisplayName} bölgesinde güvenli ve verimli bir uygulama süreci yönetiyoruz.`,
  `{locationDisplayName} bölgesinde sunduğumuz anahtar teslim {serviceTitle} çözümleriyle işletmenizi bir sonraki seviyeye taşıyoruz.`,
  `Ücretsiz keşif, rekabetçi fiyat teklifi ve uygulama garantisi — {locationDisplayName} bölgesinde {serviceTitle} için aradığınız tek durak.`,
  `ISO standartlarında kalite yönetimi ve çevre dostu malzeme seçenekleriyle {locationDisplayName} bölgesinde sürdürülebilir çözümler üretiyoruz.`,
  `{locationDisplayName} bölgesindeki referans projelerimizi yerinde gösterebilir, kalitemizi bizzat deneyimleyebilirsiniz.`,
  `Acil durumlarda hızlı müdahale ekibimizle {locationDisplayName} genelinde 7/24 destek hizmeti veriyoruz.`,
  `{cityDisplayName || locationDisplayName} bölgesinde daha önce çalıştığımız firmaların memnuniyet oranı ve geri dönüşleriyle gurur duyuyoruz.`,
  `Uzun vadeli iş ortaklıklarımız ve {locationDisplayName} bölgesindeki sürekli müşteri portföyümüzle güvenilir hizmet anlayışımızı kanıtlıyoruz.`,
];

export const BENEFIT_LINES_COUNT = 24;

export function getBenefitLine(index: number): string {
  return benefitLines[index % BENEFIT_LINES_COUNT];
}
