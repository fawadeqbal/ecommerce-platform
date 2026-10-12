/* eslint-disable @next/next/no-img-element -- images are served from object storage */
import Link from 'next/link';
import type { StorefrontProductCard } from '@ecommerce/types';
import { cn } from '@ecommerce/ui';
import { Money } from '@/components/locale/locale-provider';
import { WishlistButton } from '@/components/wishlist/wishlist-button';
import { QuickAdd } from './quick-add';

export interface ProductCardProps {
  product: StorefrontProductCard;
  /** Corner label: "New" (violet) — the discount pill shows on its own. */
  badge?: 'new';
  /** Best-seller rank shown in the top-left corner. */
  rank?: number;
  /** Shows an "Add to cart" button under the card. */
  quickAdd?: boolean;
  /** Price in violet (deal rows). */
  dealPrice?: boolean;
  /** "Sold by …" line (listings). */
  showVendor?: boolean;
  /** Heart button in the image corner (listings). */
  wishlist?: boolean;
}

export function ProductCard({
  product: p,
  badge,
  rank,
  quickAdd,
  dealPrice,
  showVendor,
  wishlist,
}: ProductCardProps) {
  const discount = p.compareAtPrice ? Math.round((1 - p.price / p.compareAtPrice) * 100) : 0;
  const href = `/products/${p.slug}`;
  return (
    <div className="group relative flex flex-col gap-2 rounded-2xl bg-white p-2 transition-shadow hover:shadow-card">
      <Link
        href={href}
        className="relative block aspect-square overflow-hidden rounded-xl bg-gray-50"
        tabIndex={-1}
        aria-hidden
      >
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt=""
            className="h-full w-full object-contain p-3 mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-gray-400">
            No image
          </span>
        )}
        {rank === undefined && discount > 0 ? (
          <span className="pointer-events-none absolute left-2 top-2 -rotate-[4deg] rounded-full bg-accent px-[9px] py-1 text-[13px] font-extrabold text-gray-900">
            −{discount}%
          </span>
        ) : null}
        {rank === undefined && discount <= 0 && badge === 'new' ? (
          <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-bold text-white">
            New
          </span>
        ) : null}
        {!p.inStock ? (
          <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-gray-900/80 px-2.5 py-1 text-xs font-semibold text-white">
            Out of stock
          </span>
        ) : null}
      </Link>
      {wishlist ? (
        <span className="absolute right-4 top-4">
          <WishlistButton productId={p.id} slug={p.slug} variant="icon" />
        </span>
      ) : null}
      {rank !== undefined ? (
        <span
          className={cn(
            'pointer-events-none absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-br-[18px] rounded-tl-2xl text-lg font-extrabold',
            rank === 1 ? 'bg-accent text-gray-900' : 'bg-brand-600 text-white',
          )}
        >
          {rank}
        </span>
      ) : null}
      <div className="flex flex-1 flex-col gap-1 px-1.5 pb-1.5">
        {p.brandName || p.ratingCount > 0 ? (
          <p className="text-xs text-gray-500">
            {p.brandName}
            {p.brandName && p.ratingCount > 0 ? ' · ' : ''}
            {p.ratingCount > 0 ? (
              <>
                <span className="font-semibold text-gray-900">★ {p.ratingAverage.toFixed(1)}</span>{' '}
                ({p.ratingCount})
              </>
            ) : null}
          </p>
        ) : null}
        <Link
          href={href}
          className="line-clamp-2 min-h-[39px] text-sm text-gray-900 hover:text-brand-600"
        >
          {p.name}
        </Link>
        <div className="mt-auto flex flex-wrap items-baseline gap-1.5">
          <span className={cn('text-[17px] font-extrabold', dealPrice && 'text-brand-600')}>
            {p.hasOptions ? (
              <span className="text-xs font-semibold text-gray-500">From </span>
            ) : null}
            <Money amount={p.price} currency={p.currency} />
          </span>
          {p.compareAtPrice ? (
            <span className="text-xs text-gray-500 line-through">
              <Money amount={p.compareAtPrice} currency={p.currency} />
            </span>
          ) : null}
        </div>
        {showVendor ? <p className="text-xs text-gray-500">Sold by {p.vendor.name}</p> : null}
      </div>
      {quickAdd ? <QuickAdd slug={p.slug} hasOptions={p.hasOptions} inStock={p.inStock} /> : null}
    </div>
  );
}
