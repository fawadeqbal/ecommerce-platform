import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { ProductGallery } from '@/components/catalog/product-gallery';
import { ProductPurchase } from '@/components/catalog/product-purchase';
import { ProductQuestions } from '@/components/reviews/product-questions';
import { ProductReviews } from '@/components/reviews/product-reviews';
import { Stars } from '@/components/reviews/stars';
import { ApiClientError, storefrontApi } from '@/lib/api-client';

/** Stock must be live, so product pages are rendered per request. */
const getProduct = cache(async (slug: string) => {
  try {
    return await storefrontApi.product(slug, { cache: 'no-store' });
  } catch (e) {
    if (e instanceof ApiClientError && e.status === 404) return null;
    throw e;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDescription ?? undefined,
    openGraph: { images: product.images[0] ? [product.images[0].url] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((i) => i.url),
    description: product.shortDescription ?? undefined,
    brand: product.brand ? { '@type': 'Brand', name: product.brand.name } : undefined,
    aggregateRating:
      product.ratingCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.ratingAverage,
            reviewCount: product.ratingCount,
          }
        : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: product.currency,
      price: product.price,
      availability: product.variants.some((v) => v.available > 0)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link href="/products" className="hover:text-gray-800">
          Shop
        </Link>{' '}
        ›{' '}
        <Link href={`/categories/${product.category.slug}`} className="hover:text-gray-800">
          {product.category.name}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />
        <div className="space-y-6">
          <div className="space-y-2">
            {product.brand ? (
              <p className="text-sm uppercase tracking-wide text-gray-500">{product.brand.name}</p>
            ) : null}
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            {product.ratingCount > 0 ? (
              <a
                href="#reviews"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:underline"
              >
                <Stars value={product.ratingAverage} />
                {product.ratingAverage.toFixed(1)} · {product.ratingCount} review
                {product.ratingCount === 1 ? '' : 's'}
              </a>
            ) : null}
            {product.shortDescription ? (
              <p className="text-gray-600">{product.shortDescription}</p>
            ) : null}
            <p className="text-sm text-gray-500">
              Sold by <span className="font-medium text-gray-800">{product.vendor.name}</span>
            </p>
          </div>
          <ProductPurchase product={product} />
        </div>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Description</h2>
          <p className="whitespace-pre-line text-gray-700">
            {product.description ?? 'No description.'}
          </p>
        </section>
        {product.specifications.length > 0 ? (
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Specifications</h2>
            <dl className="divide-y divide-gray-100 rounded-xl border border-gray-200">
              {product.specifications.map((s) => (
                <div key={s.label} className="grid grid-cols-2 gap-4 px-4 py-2.5 text-sm">
                  <dt className="text-gray-500">{s.label}</dt>
                  <dd className="text-gray-900">{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>

      <section id="reviews" className="mt-12 scroll-mt-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Customer reviews</h2>
        <ProductReviews productId={product.id} slug={product.slug} />
      </section>

      <section id="questions" className="mt-12 scroll-mt-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Questions &amp; answers</h2>
        <ProductQuestions productId={product.id} slug={product.slug} />
      </section>
    </div>
  );
}
