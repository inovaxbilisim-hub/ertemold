import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/core/utils/host'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = await getSiteUrl();
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/debug-log/', '/diag/', '/diagnostic/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
