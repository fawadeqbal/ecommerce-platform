import type { MetadataRoute } from 'next';

/** TODO: pull products, categories, brands, stores, blog posts and pages from the API (SeoModule). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return ['', '/products', '/blog', '/faq', '/contact'].map((path) => ({
    url: `${site}${path}`,
    changeFrequency: 'daily',
    priority: path === '' ? 1 : 0.7,
  }));
}
