import type {
  Paginated,
  StorefrontProductCard,
  StorefrontProductDetail,
  StorefrontProductQuery,
} from '@ecommerce/types';
import { api, type RequestOptions } from '../http';

function toQuery(params: StorefrontProductQuery): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== null) qs.set(key, String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

/** Public catalog. Usable from server components (pass `next`/`cache` options). */
export const storefrontApi = {
  products: (params: StorefrontProductQuery = {}, options?: RequestOptions) =>
    api<Paginated<StorefrontProductCard>>(`/catalog/products${toQuery(params)}`, options),
  product: (slug: string, options?: RequestOptions) =>
    api<StorefrontProductDetail>(`/catalog/products/${encodeURIComponent(slug)}`, options),
};
