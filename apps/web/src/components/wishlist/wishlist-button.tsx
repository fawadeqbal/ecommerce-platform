'use client';

import Link from 'next/link';
import { cn } from '@ecommerce/ui';
import { useMe } from '@/hooks/use-cart';
import { useToggleWishlist, useWishlist } from '@/hooks/use-wishlist';

/** `button` = text button, `icon` = round heart on product cards, `square` = 54px tile (product page). */
export function WishlistButton({
  productId,
  variantId,
  slug,
  variant = 'button',
}: {
  productId: string;
  variantId?: string;
  slug: string;
  variant?: 'button' | 'icon' | 'square';
}) {
  const me = useMe();
  const { data } = useWishlist();
  const toggle = useToggleWishlist();
  const saved = data?.productIds.includes(productId) ?? false;
  const base =
    'inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition';

  if (variant !== 'button') {
    const shape =
      variant === 'icon'
        ? 'h-[34px] w-[34px] rounded-full text-base shadow-[0_2px_8px_rgba(27,24,48,.12)]'
        : 'h-[54px] w-[54px] rounded-2xl text-xl';
    const cls = cn(
      'inline-flex items-center justify-center bg-white transition-colors',
      shape,
      saved ? 'text-rose-600' : 'text-gray-600 hover:text-rose-600',
    );
    return me.data ? (
      <button
        type="button"
        aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
        aria-pressed={saved}
        disabled={toggle.isPending}
        onClick={() => toggle.mutate({ productId, variantId, saved })}
        className={cls}
      >
        {saved ? '♥' : '♡'}
      </button>
    ) : (
      <Link href={`/login?next=/products/${slug}`} aria-label="Save to wishlist" className={cls}>
        ♡
      </Link>
    );
  }

  if (!me.data) {
    return (
      <Link
        href={`/login?next=/products/${slug}`}
        className={cn(base, 'border-gray-300 text-gray-700 hover:border-brand-400')}
      >
        ♡ Save
      </Link>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={saved}
      disabled={toggle.isPending}
      onClick={() => toggle.mutate({ productId, variantId, saved })}
      className={cn(
        base,
        saved
          ? 'border-rose-300 bg-rose-50 text-rose-700'
          : 'border-gray-300 text-gray-700 hover:border-brand-400',
      )}
    >
      {saved ? '♥ Saved' : '♡ Save'}
    </button>
  );
}
