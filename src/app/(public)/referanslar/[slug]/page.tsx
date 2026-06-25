import { notFound } from 'next/navigation';
import { getReferenceDetail, getServiceDetail, getReferences } from '@/modules/content/lib/data-services';
import ReferenceDetailTemplate from '@/modules/content/templates/ReferenceDetailTemplate';
import { Metadata } from 'next';
import StructuredData from '@/modules/seo/components/StructuredData';
import { MetaGenerator } from '@/domains/seo-engine';
import { getSettings } from '@/lib/data';
import { getSiteUrl } from '@/core/utils/host';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const references = await getReferences();
  return references.map((ref) => ({
    slug: ref.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const reference = await getReferenceDetail(slug);
  
  if (!reference) {
    return { title: 'Bulunamadı' };
  }
  
  const title = `${reference.name} | Referanslarımız`;
  const desc = reference.projectSummary || reference.description?.substring(0, 150) || `${reference.name} projesi detayları ve fotoğrafları.`;

  return MetaGenerator.generate({
    title,
    description: desc,
    image: reference.featuredImageUrl || undefined,
    canonicalPath: `/referanslar/${slug}`,
  });
}

export default async function ReferenceDetailPage({ params }: Props) {
  const { slug } = await params;
  const [reference, settings] = await Promise.all([
    getReferenceDetail(slug),
    getSettings().catch(() => null),
  ]);
  
  if (!reference) {
    notFound();
  }

  let service = undefined;
  if (reference.service_slug) {
    service = await getServiceDetail(reference.service_slug) ?? undefined;
  }

  // Schema.org AEO/SEO
  const schemas: any[] = [];
  
  const projectSchema = {
    '@context': 'https://schema.org',
    '@type': 'Project',
    name: reference.name,
    description: reference.projectSummary || reference.description?.substring(0, 150),
    image: reference.featuredImageUrl ? [reference.featuredImageUrl] : [],
    locationCreated: reference.city_name ? {
      '@type': 'Place',
      name: reference.city_name
    } : undefined,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/referanslar/${slug}`,
    ...(service && {
      serviceType: service.title
    })
  };
  schemas.push(projectSchema);

  // AEO: FAQ Schema for Challenge & Solution
  if (reference.challenge && reference.solution) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `${reference.name} projesinde karşılaşılan temel zorluk (problem) neydi?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: reference.challenge
          }
        },
        {
          '@type': 'Question',
          name: `${reference.name} projesindeki zorluklara nasıl bir çözüm uygulandı?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: reference.solution
          }
        }
      ]
    });
  }

  // AEO: Video Schema
  if (reference.primary_video_url) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: `${reference.name} Projesi Uygulama Videosu`,
      description: reference.projectSummary || `${reference.name} projesine ait detaylı uygulama ve sonuç videosu.`,
      thumbnailUrl: reference.featuredImageUrl ? [reference.featuredImageUrl] : [],
      uploadDate: reference.project_date || new Date().toISOString(),
      contentUrl: reference.primary_video_url,
      embedUrl: reference.primary_video_url
    });
  }

  const siteUrl = await getSiteUrl();
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Referanslar', item: `${siteUrl}/referanslar` },
      { '@type': 'ListItem', position: 3, name: reference.name, item: `${siteUrl}/referanslar/${slug}` },
    ],
  });

  return (
    <>
      <StructuredData id="reference-schema" data={schemas} />
      <ReferenceDetailTemplate reference={reference} service={service} settings={settings} />
    </>
  );
}
