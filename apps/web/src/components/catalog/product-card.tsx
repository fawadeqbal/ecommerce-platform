/* eslint-disable @next/next/no-img-element -- images are served from object storage */
import Link from 'next/link';
import type { StorefrontProductCard } from '@ecommerce/types';
import { Money } from '@/components/locale/locale-provider';

export function ProductCard({ product: p }: { product: StorefrontProductCard }) {
  const discount = p.compareAtPrice ? Math.round((1 - p.price / p.compareAtPrice) * 100) : 0;
  return (
    <Link
      href={`/products/${p.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square bg-gray-50">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.name}
            className="h-full w-full object-contain p-4"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}
        {discount > 0 ? (
          <span className="absolute left-2 top-2 rounded-md bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
            −{discount}%
          </span>
        ) : null}
        {!p.inStock ? (
          <span className="absolute right-2 top-2 rounded-md bg-gray-800/80 px-2 py-0.5 text-xs font-medium text-white">
            Out of stock
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {p.brandName ? (
          <p className="text-xs uppercase tracking-wide text-gray-500">{p.brandName}</p>
        ) : null}
        <h3 className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-brand-700">
          {p.name}
        </h3>
        <div className="mt-auto pt-2">
          <span className="text-base font-semibold text-gray-900">
            {p.hasOptions ? 'From ' : ''}
            <Money amount={p.price} currency={p.currency} />
          </span>
          {p.compareAtPrice ? (
            <span className="ml-2 text-xs text-gray-400 line-through">
              <Money amount={p.compareAtPrice} currency={p.currency} />
            </span>
          ) : null}
        </div>
        <p className="text-xs text-gray-500">Sold by {p.vendor.name}</p>
      </div>
    </Link>
  );
}
