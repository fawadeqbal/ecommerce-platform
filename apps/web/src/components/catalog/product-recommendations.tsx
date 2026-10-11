import type { StorefrontProductCard } from '@ecommerce/types';
import { storefrontApi } from '@/lib/api-client';
import { ProductCard } from './product-card';

function Row({ title, products }: { title: string; products: StorefrontProductCard[] }) {
  if (products.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

/** Server component: "frequently bought together" and "related products". Silent if the API fails. */
export async function ProductRecommendations({ slug }: { slug: string }) {
  const recs = await storefrontApi
    .recommendations(slug, { next: { revalidate: 300 } })
    .catch(() => null);
  if (!recs) return null;
  return (
    <>
      <Row title="Frequently bought together" products={recs.boughtTogether} />
      <Row title="You may also like" products={recs.related.slice(0, 4)} />
    </>
  );
}
