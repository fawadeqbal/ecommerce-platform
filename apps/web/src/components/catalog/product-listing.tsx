import Link from 'next/link';
import {
  STOREFRONT_SORTS,
  STOREFRONT_SORT_LABELS,
  flattenCategoryTree,
  type StorefrontProductQuery,
  type StorefrontSort,
} from '@ecommerce/types';
import { Alert, EmptyState, buttonStyles } from '@ecommerce/ui';
import { brandsApi, categoriesApi, storefrontApi } from '@/lib/api-client';
import { ProductCard } from './product-card';

type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

/** Server-rendered listing with GET-form filters (works without JavaScript, SEO friendly). */
export async function ProductListing({
  searchParams,
  fixedCategory,
  title,
}: {
  searchParams: SearchParams;
  fixedCategory?: string;
  title: string;
}) {
  const query: StorefrontProductQuery = {
    q: first(searchParams.q) || undefined,
    category: fixedCategory ?? (first(searchParams.category) || undefined),
    brand: first(searchParams.brand) || undefined,
    sort: (STOREFRONT_SORTS as readonly string[]).includes(first(searchParams.sort))
      ? (first(searchParams.sort) as StorefrontSort)
      : undefined,
    minPrice: first(searchParams.minPrice) ? Number(first(searchParams.minPrice)) : undefined,
    maxPrice: first(searchParams.maxPrice) ? Number(first(searchParams.maxPrice)) : undefined,
    featured: first(searchParams.featured) === 'true' || undefined,
    page: Math.max(1, Number(first(searchParams.page)) || 1),
    limit: 24,
  };

  const [result, tree, brands] = await Promise.allSettled([
    storefrontApi.products(query, { cache: 'no-store' }),
    categoriesApi.tree(),
    brandsApi.list(),
  ]);

  const categories = tree.status === 'fulfilled' ? flattenCategoryTree(tree.value) : [];
  const brandList = brands.status === 'fulfilled' ? brands.value : [];

  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      const v = first(value);
      if (v && key !== 'page') params.set(key, v);
    }
    params.set('page', String(page));
    return `?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {query.q ? `Results for “${query.q}”` : title}
      </h1>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <form method="get" className="space-y-5 text-sm">
          {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
          {query.featured ? <input type="hidden" name="featured" value="true" /> : null}
          {!fixedCategory ? (
            <label className="block space-y-1">
              <span className="font-medium text-gray-700">Category</span>
              <select
                name="category"
                defaultValue={query.category ?? ''}
                className="h-10 w-full rounded-lg border border-gray-300 px-2"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {'\u00a0\u00a0'.repeat(c.depth)}
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="block space-y-1">
            <span className="font-medium text-gray-700">Brand</span>
            <select
              name="brand"
              defaultValue={query.brand ?? ''}
              className="h-10 w-full rounded-lg border border-gray-300 px-2"
            >
              <option value="">All brands</option>
              {brandList.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="space-y-1">
            <legend className="font-medium text-gray-700">Price</legend>
            <div className="flex gap-2">
              <input
                name="minPrice"
                type="number"
                min={0}
                placeholder="Min"
                defaultValue={query.minPrice ?? ''}
                className="h-10 w-full rounded-lg border border-gray-300 px-2"
              />
              <input
                name="maxPrice"
                type="number"
                min={0}
                placeholder="Max"
                defaultValue={query.maxPrice ?? ''}
                className="h-10 w-full rounded-lg border border-gray-300 px-2"
              />
            </div>
          </fieldset>
          <label className="block space-y-1">
            <span className="font-medium text-gray-700">Sort by</span>
            <select
              name="sort"
              defaultValue={query.sort ?? 'newest'}
              className="h-10 w-full rounded-lg border border-gray-300 px-2"
            >
              {STOREFRONT_SORTS.map((s) => (
                <option key={s} value={s}>
                  {STOREFRONT_SORT_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <button type="submit" className={buttonStyles({ className: 'flex-1' })}>
              Apply
            </button>
            <Link
              href={fixedCategory ? `/categories/${fixedCategory}` : '/products'}
              className={buttonStyles({ variant: 'outline' })}
            >
              Reset
            </Link>
          </div>
        </form>

        <div>
          {result.status === 'rejected' ? (
            <Alert tone="error" title="Could not load products">
              The store is temporarily unavailable. Please try again in a moment.
            </Alert>
          ) : result.value.items.length === 0 ? (
            <EmptyState title="No products found" description="Try removing some filters." />
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-500">{result.value.meta.total} products</p>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {result.value.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {result.value.meta.totalPages > 1 ? (
                <nav
                  className="mt-8 flex items-center justify-center gap-2 text-sm"
                  aria-label="Pagination"
                >
                  {query.page && query.page > 1 ? (
                    <Link
                      href={pageHref(query.page - 1)}
                      className={buttonStyles({ variant: 'outline', size: 'sm' })}
                    >
                      Previous
                    </Link>
                  ) : null}
                  <span className="px-2 text-gray-600">
                    Page {result.value.meta.page} of {result.value.meta.totalPages}
                  </span>
                  {result.value.meta.page < result.value.meta.totalPages ? (
                    <Link
                      href={pageHref(result.value.meta.page + 1)}
                      className={buttonStyles({ variant: 'outline', size: 'sm' })}
                    >
                      Next
                    </Link>
                  ) : null}
                </nav>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
