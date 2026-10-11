import Link from 'next/link';
import type { StorefrontProductCard } from '@ecommerce/types';
import { buttonStyles } from '@ecommerce/ui';
import { ProductCard } from '@/components/catalog/product-card';
import { storefrontApi } from '@/lib/api-client';

async function section(
  params: Parameters<typeof storefrontApi.products>[0],
): Promise<StorefrontProductCard[]> {
  try {
    return (await storefrontApi.products(params, { next: { revalidate: 60 } })).items;
  } catch {
    return [];
  }
}

function Row({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: StorefrontProductCard[];
}) {
  if (products.length === 0) return null;
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <Link href={href} className="text-sm font-medium text-brand-700 hover:underline">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [featured, latest] = await Promise.all([
    section({ featured: true, limit: 4 }),
    section({ sort: 'newest', limit: 8 }),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-8">
      {/* TODO: hero banners from the CMS module */}
      <section className="rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 px-8 py-14 text-white">
        <h1 className="max-w-xl text-4xl font-bold">
          Everything you need, from sellers you can trust
        </h1>
        <p className="mt-3 max-w-lg text-brand-50">
          Phones, laptops, fashion and more, with cash on delivery.
        </p>
        <Link
          href="/products"
          className={buttonStyles({
            variant: 'secondary',
            size: 'lg',
            className: 'mt-6 bg-white text-brand-800 hover:bg-brand-50',
          })}
        >
          Shop now
        </Link>
      </section>
      <Row title="Featured" href="/products?featured=true" products={featured} />
      <Row title="New arrivals" href="/products?sort=newest" products={latest} />
      {featured.length === 0 && latest.length === 0 ? (
        <p className="text-center text-gray-500">
          No products yet. Approve products in the admin to see them here.
        </p>
      ) : null}
    </div>
  );
}
