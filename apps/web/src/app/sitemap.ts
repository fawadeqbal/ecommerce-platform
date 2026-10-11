import type { MetadataRoute } from 'next';
import type { SitemapEntries } from '@ecommerce/types';
import { blogApi } from '@/lib/api-client';

export const revalidate = 3600;

/** Static routes + CMS pages + blog posts. (Products, categories and stores follow with the SEO module.) */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const fixed: MetadataRoute.Sitemap = ['', '/products', '/blog', '/faq', '/track-order'].map(
    (path) => ({
      url: `${site}${path}`,
      changeFrequency: 'daily',
      priority: path === '' ? 1 : 0.7,
    }),
  );

  const cms: SitemapEntries = await blogApi
    .sitemap({ next: { revalidate: 3600 } })
    .catch(() => ({ pages: [], posts: [] }));

  return [
    ...fixed,
    ...cms.pages.map((p) => ({
      url: `${site}/pages/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    })),
    ...cms.posts.map((p) => ({
      url: `${site}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
