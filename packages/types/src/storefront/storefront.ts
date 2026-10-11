/** Public product data for the storefront (only published products of approved vendors). */

export const STOREFRONT_SORTS = ['newest', 'price_asc', 'price_desc', 'popular', 'rating'] as const;
export type StorefrontSort = (typeof STOREFRONT_SORTS)[number];

export const STOREFRONT_SORT_LABELS: Record<StorefrontSort, string> = {
  newest: 'Newest',
  price_asc: 'Price: low to high',
  price_desc: 'Price: high to low',
  popular: 'Best selling',
  rating: 'Top rated',
};

export interface StorefrontProductQuery {
  q?: string;
  category?: string;
  brand?: string;
  vendor?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: StorefrontSort;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface StorefrontProductCard {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  brandName: string | null;
  vendor: { name: string; slug: string };
  ratingAverage: number;
  ratingCount: number;
  inStock: boolean;
  /** True when the product has options (shows "from" price). */
  hasOptions: boolean;
}

export interface StorefrontVariant {
  id: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  isDefault: boolean;
  /** Units that can be bought right now (on hand − reserved, active warehouses). */
  available: number;
  /** attributeId -> valueId */
  values: Record<string, string>;
  label: string | null;
}

export interface StorefrontOption {
  attributeId: string;
  name: string;
  type: string;
  values: { id: string; label: string; swatch: string | null }[];
}

export interface StorefrontProductDetail {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  specifications: { label: string; value: string }[];
  images: { url: string; altText: string | null }[];
  currency: string;
  price: number;
  compareAtPrice: number | null;
  ratingAverage: number;
  ratingCount: number;
  category: { name: string; slug: string };
  brand: { name: string; slug: string } | null;
  vendor: { name: string; slug: string; logoUrl: string | null };
  options: StorefrontOption[];
  variants: StorefrontVariant[];
  defaultVariantId: string;
  seoTitle: string | null;
  seoDescription: string | null;
}

/** Finds the variant matching the selected option values (null when the combination doesn't exist). */
export function findVariant(
  variants: StorefrontVariant[],
  options: StorefrontOption[],
  selected: Record<string, string>,
): StorefrontVariant | null {
  if (options.length === 0) return variants.find((v) => v.isDefault) ?? variants[0] ?? null;
  return (
    variants.find((v) =>
      options.every((o) => v.values[o.attributeId] === selected[o.attributeId]),
    ) ?? null
  );
}
