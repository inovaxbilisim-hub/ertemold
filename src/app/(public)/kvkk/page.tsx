import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLegalPages, getSettings } from '@/lib/data';
import StructuredData from '@/modules/seo/components/StructuredData';
import { getSiteUrl } from '@/core/utils/host';
import { Shield, Clock } from 'lucide-react';

interface LegalPageData {
  title: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  lastUpdated: string;
  published: boolean;
}

const pageId = 'kvkk';

async function getLegalData(): Promise<LegalPageData | null> {
  try {
    const allData = await getLegalPages();
    return allData[pageId] as LegalPageData | null;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getLegalData();
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
  };
}

export default async function LegalPage() {
  const data = await getLegalData();
  const settings = await getSettings();
  const badgeText = settings?.uiContent?.legal?.badge || 'Yasal Bilgilendirme';

  if (!data || !data.published) {
    notFound();
  }

  const siteUrl = await getSiteUrl();
  const kvkkSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: data.title,
      description: data.metaDescription,
      url: `${siteUrl}/${pageId}`,
      lastReviewed: data.lastUpdated,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: data.title, item: `${siteUrl}/${pageId}` },
      ],
    },
  ];

  return (
    <main className="bg-[#fbfcff] min-h-screen pt-40 pb-32 px-6">
      <StructuredData id={`${pageId}-schema`} data={kvkkSchemas} />
      <div className="container-boxed bg-white p-10 md:p-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/[0.02] blur-[100px] rounded-full pointer-events-none" />

        <article className="max-w-[900px]">
          <header className="mb-16 border-b border-black/5 pb-12">
            <div className="inline-flex items-center gap-3 bg-black/[0.02] border border-black/5 rounded-full px-5 py-2 mb-8 shadow-sm">
              <Shield size={16} className="text-blue-600" />
              <span className="text-black/60 text-[11px] font-black uppercase tracking-[0.3em]">{badgeText}</span>
            </div>

            <h1 className="text-xl md:text-2xl font-black text-black mb-8 italic uppercase tracking-tighter leading-[0.95]">
              {data.title}
            </h1>

            <div className="flex items-center gap-3 text-black/40 text-[11px] font-black uppercase tracking-widest">
              <Clock size={16} />
              Son Güncelleme: {new Date(data.lastUpdated).toLocaleDateString('tr-TR')}
            </div>
          </header>

          <div
            className="legal-content prose prose-zinc max-w-none text-black/60"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        </article>

        <style>{`
          .legal-content h2 { color: #000; font-size: 2.5rem; margin: 4rem 0 2rem; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -0.05em; line-height: 0.95; }
          .legal-content h3 { color: #000; font-size: 1.75rem; margin: 3rem 0 1.5rem; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -0.02em; }
          .legal-content p { margin-bottom: 1.5rem; line-height: 1.7; font-size: 1.125rem; font-weight: 500; }
          .legal-content ul { margin-bottom: 2rem; padding-left: 1.5rem; list-style-type: square; }
          .legal-content li { margin-bottom: 0.75rem; line-height: 1.5; }
          .legal-content strong { color: #000; font-weight: 800; }
        `}</style>
      </div>
    </main>
  );
}

