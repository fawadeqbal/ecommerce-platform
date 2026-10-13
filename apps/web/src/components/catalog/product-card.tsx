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
  quickAdd?: boolean | 'icon';
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
    <div className="group relative flex flex-col gap-2.5 rounded-[22px] bg-white p-2 ring-1 ring-black/[.04] transition-shadow duration-300 hover:shadow-[0_16px_34px_-20px_rgba(30,26,51,.45)]">
      <Link
        href={href}
        className="relative block aspect-square overflow-hidden rounded-2xl bg-[#f6f6f8]"
        tabIndex={-1}
        aria-hidden
      >
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt=""
            className={cn(
              'h-full w-full object-contain p-[10%] mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-[1.04]',
              !p.inStock && 'opacity-50 grayscale',
            )}
            loading="lazy"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-gray-400">
            No image
          </span>
        )}
        {rank === undefined && discount > 0 ? (
          <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-lg bg-accent px-2 py-[3px] text-[12px] font-extrabold text-gray-900">
            −{discount}%
          </span>
        ) : null}
        {rank === undefined && discount <= 0 && badge === 'new' ? (
          <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-lg bg-brand-600 px-2 py-[3px] text-[11px] font-bold uppercase tracking-wide text-white">
            New
          </span>
        ) : null}
        {!p.inStock ? (
          <span className="pointer-events-none absolute bottom-2.5 left-2.5 rounded-lg bg-white/90 px-2 py-[3px] text-[11px] font-semibold text-gray-700 ring-1 ring-black/5">
            Out of stock
          </span>
        ) : null}
      </Link>
      {wishlist ? (
        <span className="absolute right-[14px] top-[14px]">
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
      <div className="flex flex-1 flex-col gap-1.5 px-2 pb-2">
        {p.brandName || p.ratingCount > 0 ? (
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate font-medium uppercase tracking-wide text-gray-400">
              {p.brandName}
            </span>
            {p.ratingCount > 0 ? (
              <span className="flex flex-none items-center gap-1 font-semibold text-gray-700">
                <span className="text-amber-400">★</span>
                {p.ratingAverage.toFixed(1)}
                <span className="font-normal text-gray-400">({p.ratingCount})</span>
              </span>
            ) : null}
          </div>
        ) : null}
        <Link
          href={href}
          className="line-clamp-2 min-h-[40px] text-[14px] font-medium leading-snug text-gray-900 hover:text-brand-600"
        >
          {p.name}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
          <span className={cn('text-[18px] font-extrabold tracking-[-0.02em] text-gray-900', dealPrice && 'text-brand-600')}>
            {p.hasOptions ? (
              <span className="text-xs font-semibold text-gray-500">From </span>
            ) : null}
            <Money amount={p.price} currency={p.currency} />
          </span>
          {p.compareAtPrice ? (
            <span className="text-xs text-gray-400 line-through">
              <Money amount={p.compareAtPrice} currency={p.currency} />
            </span>
          ) : null}
        </div>
        {quickAdd === 'icon' ? (
          <QuickAdd
            compact
            slug={p.slug}
            hasOptions={p.hasOptions}
            inStock={p.inStock}
            name={p.name}
            imageUrl={p.imageUrl}
          />
        ) : null}
        </div>
        {showVendor ? <p className="text-xs text-gray-500">Sold by {p.vendor.name}</p> : null}
      </div>
      {quickAdd === true ? (
        <QuickAdd
          slug={p.slug}
          hasOptions={p.hasOptions}
          inStock={p.inStock}
          name={p.name}
          imageUrl={p.imageUrl}
        />
      ) : null}
    </div>
  );
}
