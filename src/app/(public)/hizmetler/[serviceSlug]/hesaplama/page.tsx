import { notFound } from 'next/navigation';
import { getServices, getServiceDetail } from '@/lib/data';
import { getSettings, getFaqsForPage } from '@/lib/data';
import { buildFaqSchema } from '@/modules/seo/lib/faq-schema';
import { MetaGenerator } from '@/domains/seo-engine';
import { SchemaGenerator, SpeakableGenerator } from '@/domains/seo-engine';
import StructuredData from '@/modules/seo/components/StructuredData';
import CalculatorPageTemplate from '@/modules/content/templates/CalculatorPageTemplate';
import { getSiteUrl } from '@/core/utils/host';

export const revalidate = 604800; // 1 hafta cache

// Tüm aktif hizmetler için statik sayfa üret
export async function generateStaticParams() {
  const services = await getServices();
  return services
    .filter((s) => s.active)
    .map((s) => ({ serviceSlug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string }>;
}) {
  const { serviceSlug } = await params;
  const service = await getServiceDetail(serviceSlug);

  if (!service || !service.active) {
    return { title: 'Sayfa Bulunamadı' };
  }

  const settings = await getSettings().catch(() => null);

  return MetaGenerator.generate({
    title: `${service.title} m² Fiyat Hesaplama 2025 | Anlık Teklif Al`,
    description: `${service.title} maliyetini anlık hesaplayın. Kalınlık seçimi, alan boyutu ve ek hizmetlere göre ${service.title} m² fiyat tahmini. Ücretsiz ve hızlı hesaplama.`,
    canonicalPath: `/hizmetler/${serviceSlug}/hesaplama`,
    settings,
  });
}

export default async function ServiceCalculatorPage({
  params,
}: {
  params: Promise<{ serviceSlug: string }>;
}) {
  const { serviceSlug } = await params;

  const service = await getServiceDetail(serviceSlug);

  // Hizmet yoksa veya aktif değilse 404
  if (!service || !service.active) {
    return notFound();
  }

  const [settings, faqs] = await Promise.all([
    getSettings().catch(() => null),
    // "hesaplama" sayfasına özel veya genel SSS'leri getir
    getFaqsForPage('hesaplama').then(async (pageFaqs) => {
      if (pageFaqs && pageFaqs.length > 0) return pageFaqs;
      // "hesaplama" display_pages değeri yoksa genel SSS'leri getir
      const { getFaqs } = await import('@/lib/data');
      return getFaqs();
    }).catch(async () => {
      const { getFaqs } = await import('@/lib/data');
      return getFaqs();
    }),
  ]);

  const siteUrl = await getSiteUrl();

  // JSON-LD Şemaları
  const howToSchema = SchemaGenerator.buildHowToSchema(
    `${service.title} m² Nasıl Hesaplanır?`,
    `${service.title} uygulamasının maliyetini hesaplamak için alanınızı ölçün, kalınlık seçeneğini belirleyin ve ek hizmetleri ekleyin.`,
    [
      'Kaplamak istediğiniz alanın uzunluk ve genişliğini ölçün',
      'Alan boyutunu m² cinsinden hesaplayın (uzunluk × genişlik)',
      'İhtiyacınıza uygun kalınlık seçeneğini belirleyin',
      'Varsa ek hizmetleri (zemin hazırlığı, primer vb.) seçin',
      'Hesapla butonuna tıklayın ve anlık fiyat tahmininizi görün',
    ].map((text) => text),
  );

  const faqSchema = buildFaqSchema(faqs);

  const serviceSchema = await SchemaGenerator.buildServiceSchema({
    service,
    settings,
    canonicalPath: `/hizmetler/${serviceSlug}/hesaplama`,
  }).catch(() => null);

  const speakableSchema = await SpeakableGenerator.build({
    title: `${service.title} m² Fiyat Hesaplama`,
    description: `${service.title} maliyetini anlık hesaplayın. Kalınlık ve alan seçimine göre fiyat tahmini.`,
    pageType: 'service_detail',
  });

  const productSchema = service.calculator_price_per_sqm ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${service.title} m² Uygulaması`,
    description: service.calculator_description || service.description,
    image: service.imagePath ? `${siteUrl}${service.imagePath}` : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'TRY', // varsayılan
      price: service.calculator_price_per_sqm,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/hizmetler/${serviceSlug}/hesaplama`
    }
  } : null;

  return (
    <>
      {/* JSON-LD Yapısal Veriler */}
      {howToSchema?.['@type'] && (
        <StructuredData
          id={`calc-${service.id}-howto`}
          data={howToSchema}
        />
      )}
      {faqSchema && (
        <StructuredData
          id={`calc-${service.id}-faq`}
          data={faqSchema}
        />
      )}
      {serviceSchema && (
        <StructuredData
          id={`calc-${service.id}-service`}
          data={serviceSchema}
        />
      )}
      <StructuredData
        id={`calc-${service.id}-speakable`}
        data={speakableSchema}
      />
      {productSchema && (
        <StructuredData
          id={`calc-${service.id}-product`}
          data={productSchema}
        />
      )}

      {/* Sayfa İçeriği */}
      <CalculatorPageTemplate
        service={service}
        faqs={faqs}
        settings={settings}
        siteUrl={siteUrl}
      />
    </>
  );
}
