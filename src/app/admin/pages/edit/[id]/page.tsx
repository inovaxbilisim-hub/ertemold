import { redirect } from 'next/navigation';
import { dbAll } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';
import Link from 'next/link';
import TemplateEditor from './TemplateEditor';

export const dynamic = 'force-dynamic';

export default async function PageEditor({ params }: { params: Promise<{ id: string }> }) {
  const isAuth = await verifySession();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const { id } = await params;

  // Retrieve the page by ID or Slug fallback
  const normalizedSlug = id.startsWith('/') ? id : `/${id}`;
  
  // Use CAST(id AS TEXT) to safely compare numeric or string IDs with the 'id' parameter
  // without causing a PostgreSQL type mismatch error.
  const result = await dbAll<any>(
    'SELECT * FROM pages WHERE CAST(id AS TEXT) = ? OR slug = ? OR slug = ? LIMIT 1', 
    [id, id, normalizedSlug]
  );
  
  if (result.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Sayfa Bulunamadı</h2>
        <p>Aradığınız sayfa silinmiş veya mevcut değil.</p>
        <Link href="/admin" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>Admin Paneline Dön</Link>
      </div>
    );
  }

  const pageData = result[0];
  
  // Fetch Hero Data if it's the home page
  let heroData = null;
  if (pageData.template_name === 'home') {
    const heroResult = await dbAll<any>('SELECT * FROM hero_intro LIMIT 1');
    if (heroResult.length > 0) {
      const h = heroResult[0];
      heroData = {
        ...h,
        left: {
          badge: h.badge || '',
          title: h.title || '',
          description: h.description || '',
          ctaText: h.cta_text || '',
          ctaLink: h.cta_link || '',
          ctaSecondaryText: h.cta_secondary_text || '',
          ctaSecondaryLink: h.cta_secondary_link || '',
        },
        gallery: typeof h.gallery === 'string' ? JSON.parse(h.gallery) : (h.gallery || []),
        galleryLayout: h.gallery_layout || 'masonry',
        galleryCount: h.gallery_count || 4,
      };
    }
  }
  
  // Fetch all pages for the modular page reference system
  const allPages = await dbAll<any>('SELECT id, title, slug, template_name FROM pages ORDER BY title ASC');
  
  // Ensure we pass a plain object to the Client Component
  const page = {
    id: String(pageData.id),
    slug: String(pageData.slug),
    title: String(pageData.title),
    template_name: String(pageData.template_name),
    meta_title: String(pageData.meta_title || ''),
    meta_description: String(pageData.meta_description || ''),
    content_data: typeof pageData.content_data === 'string' ? JSON.parse(pageData.content_data) : (pageData.content_data || {}),
    is_published: Boolean(pageData.is_published)
  };

  return <TemplateEditor page={page} initialHero={heroData} allPages={allPages} />;
}
