/**
 * 6 pSEO süreç adımı varyantı.
 * Mevcut pseo-utils.ts:244-251 ile birebir aynı.
 */

export const processLines: string[] = [
  `Ücretsiz keşif, teknik analiz ve proje planlaması ile süreci şeffaf tutuyoruz.`,
  `Saha keşfi sonrası maliyet, süre ve garanti detaylarını net şekilde belirliyoruz.`,
  `Profesyonel ekiplerimizle hızlı keşif ve güvenilir uygulama adımlarıyla hareket ediyoruz.`,
  `Öncelikle saha ziyareti yaparak zemin durumunu analiz ediyor, ardından size özel çözüm önerimizi sunuyoruz.`,
  `Uygulama öncesi zemin hazırlığı, malzeme seçimi ve maliyet analizi dahil kapsamlı bir proje planı oluşturuyoruz.`,
  `Referans projelerimizden örnekler sunuyor, ihtiyacınıza en uygun sistemi belirlemek için teknik ekibimizle yerinde inceleme yapıyoruz.`,
];

export const PROCESS_LINES_COUNT = 6;

export function getProcessLine(index: number): string {
  return processLines[index % PROCESS_LINES_COUNT];
}
