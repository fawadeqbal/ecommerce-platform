'use client';

import Link from 'next/link';
import { cn } from '@ecommerce/ui';
import { useMe } from '@/hooks/use-cart';
import { useToggleWishlist, useWishlist } from '@/hooks/use-wishlist';

export function WishlistButton({
  productId,
  variantId,
  slug,
}: {
  productId: string;
  variantId?: string;
  slug: string;
}) {
  const me = useMe();
  const { data } = useWishlist();
  const toggle = useToggleWishlist();
  const saved = data?.productIds.includes(productId) ?? false;
  const base =
    'inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition';

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
