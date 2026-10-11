import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  STOREFRONT_SORTS,
  STOREFRONT_SORT_LABELS,
  flattenCategoryTree,
  type AttributeDto,
  type StorefrontProductQuery,
  type StorefrontSort,
} from '@ecommerce/types';
import { Alert, EmptyState, buttonStyles } from '@ecommerce/ui';
import {
  attributesApi,
  brandsApi,
  categoriesApi,
  searchApi,
  storefrontApi,
} from '@/lib/api-client';
import { ProductCard } from './product-card';

type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
const all = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v : v ? [v] : [])
    .flatMap((x) => x.split(','))
    .map((x) => x.trim())
    .filter(Boolean);

const select = 'h-10 w-full rounded-lg border border-gray-300 px-2';

/** Server-rendered listing with GET-form filters (works without JavaScript, SEO friendly). */
export async function ProductListing({
  searchParams,
  fixedCategory,
  fixedBrand,
  fixedVendor,
  title,
  basePath = '/products',
  header,
}: {
  searchParams: SearchParams;
  fixedCategory?: string;
  fixedBrand?: string;
  fixedVendor?: string;
  title: string;
  /** Where "Reset" goes. */
  basePath?: string;
  /** Rendered instead of the plain title (brand / store headers). */
  header?: ReactNode;
}) {
  const q = first(searchParams.q).trim();
  const values = all(searchParams.values);
  const sortParam = first(searchParams.sort);
  const query: StorefrontProductQuery = {
    q: q || undefined,
    category: fixedCategory ?? (first(searchParams.category) || undefined),
    brand: fixedBrand ?? (first(searchParams.brand) || undefined),
    vendor: fixedVendor,
    sort: (STOREFRONT_SORTS as readonly string[]).includes(sortParam)
      ? (sortParam as StorefrontSort)
      : undefined,
    minPrice: first(searchParams.minPrice) ? Number(first(searchParams.minPrice)) : undefined,
    maxPrice: first(searchParams.maxPrice) ? Number(first(searchParams.maxPrice)) : undefined,
    minRating: first(searchParams.minRating) ? Number(first(searchParams.minRating)) : undefined,
    inStock: first(searchParams.inStock) === 'true' || undefined,
    values: values.length > 0 ? values.join(',') : undefined,
    featured: first(searchParams.featured) === 'true' || undefined,
    page: Math.max(1, Number(first(searchParams.page)) || 1),
    limit: 24,
  };

  const [result, tree, brands, attributes] = await Promise.allSettled([
    storefrontApi.products(query, { cache: 'no-store' }),
    categoriesApi.tree(),
    brandsApi.list(),
    attributesApi.filters(),
  ]);

  const categories = tree.status === 'fulfilled' ? flattenCategoryTree(tree.value) : [];
  const brandList = brands.status === 'fulfilled' ? brands.value : [];
  const attributeList: AttributeDto[] =
    attributes.status === 'fulfilled' ? attributes.value.filter((a) => a.values.length > 0) : [];
  const empty = result.status === 'fulfilled' && result.value.items.length === 0;
  const didYouMean =
    empty && q ? await searchApi.didYouMean(q, { cache: 'no-store' }).catch(() => null) : null;

  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === 'page') continue;
      for (const v of Array.isArray(value) ? value : value ? [value] : []) params.append(key, v);
    }
    params.set('page', String(page));
    return `?${params.toString()}`;
  };

  const sorts = STOREFRONT_SORTS.filter((s) => s !== 'relevance' || q);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {header ?? (
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          {q ? `Results for “${q}”` : title}
        </h1>
      )}

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <form method="get" className="space-y-5 text-sm">
          {q ? <input type="hidden" name="q" value={q} /> : null}
          {query.featured ? <input type="hidden" name="featured" value="true" /> : null}
          {!fixedCategory ? (
            <label className="block space-y-1">
              <span className="font-medium text-gray-700">Category</span>
              <select name="category" defaultValue={query.category ?? ''} className={select}>
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
          {!fixedBrand ? (
            <label className="block space-y-1">
              <span className="font-medium text-gray-700">Brand</span>
              <select name="brand" defaultValue={query.brand ?? ''} className={select}>
                <option value="">All brands</option>
                {brandList.map((b) => (
                  <option key={b.id} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <fieldset className="space-y-1">
            <legend className="font-medium text-gray-700">Price</legend>
            <div className="flex gap-2">
              <input
                name="minPrice"
                type="number"
                min={0}
                placeholder="Min"
                defaultValue={query.minPrice ?? ''}
                className={select}
              />
              <input
                name="maxPrice"
                type="number"
                min={0}
                placeholder="Max"
                defaultValue={query.maxPrice ?? ''}
                className={select}
              />
            </div>
          </fieldset>
          <label className="block space-y-1">
            <span className="font-medium text-gray-700">Rating</span>
            <select
              name="minRating"
              defaultValue={query.minRating ? String(query.minRating) : ''}
              className={select}
            >
              <option value="">Any rating</option>
              <option value="4">4★ and up</option>
              <option value="3">3★ and up</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="inStock"
              value="true"
              defaultChecked={query.inStock}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-gray-700">In stock only</span>
          </label>
          {attributeList.map((a) => (
            <fieldset key={a.id} className="space-y-1">
              <legend className="font-medium text-gray-700">{a.name}</legend>
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {a.values.map((v) => (
                  <label key={v.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="values"
                      value={v.id}
                      defaultChecked={values.includes(v.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    {v.swatch ? (
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-gray-300"
                        style={{ background: v.swatch }}
                      />
                    ) : null}
                    <span className="text-gray-700">{v.label ?? v.value}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <label className="block space-y-1">
            <span className="font-medium text-gray-700">Sort by</span>
            <select
              name="sort"
              defaultValue={query.sort ?? (q ? 'relevance' : 'newest')}
              className={select}
            >
              {sorts.map((s) => (
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
              href={q ? `${basePath}?q=${encodeURIComponent(q)}` : basePath}
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
            <div className="space-y-4">
              {didYouMean?.suggestion ? (
                <p className="text-sm text-gray-700">
                  Did you mean{' '}
                  <Link
                    href={`/search?q=${encodeURIComponent(didYouMean.suggestion)}`}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    {didYouMean.suggestion}
                  </Link>
                  ?
                </p>
              ) : null}
              <EmptyState
                title="No products found"
                description={
                  q ? 'Check the spelling or try fewer words.' : 'Try removing some filters.'
                }
              />
            </div>
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
