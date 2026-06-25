import { MetaGenerator } from '@/domains/seo-engine';
import { getPage, getServiceCategories } from '@/lib/data';

export async function generateDynamicMetadata(slug: string[]) {
  const path = '/' + slug.join('/');

  const page = await getPage(path);
  if (page && page.is_published) {
    return MetaGenerator.generate({
      pageKey: path.replace(/^\//, ''),
      title: page.meta_title as string,
      description: page.meta_description as string,
      canonicalPath: path,
      dynamicContext: { name: page.title as string },
    });
  }

  if (slug.length === 1) {
    const categories = await getServiceCategories();
    const category = categories.find(c => c.slug === slug[0] && c.active);
    if (category) {
      return MetaGenerator.generate({ pageKey: category.slug, canonicalPath: `/${category.slug}` });
    }
  }

  return {};
}
