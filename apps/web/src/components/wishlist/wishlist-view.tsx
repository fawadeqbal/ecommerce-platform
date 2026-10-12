'use client';

/* eslint-disable @next/next/no-img-element -- images are served from object storage */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Alert, Spinner, cn, formatMoney } from '@ecommerce/ui';
import { useSetCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { queryKeys, wishlistApi } from '@/lib/api-client';

export function WishlistView() {
  const queryClient = useQueryClient();
  const setCart = useSetCart();
  const { data, error, isLoading } = useWishlist();
  const remove = useMutation({
    mutationFn: (id: string) => wishlistApi.remove(id),
    onSuccess: (w) => queryClient.setQueryData(queryKeys.wishlist, w),
  });
  const move = useMutation({
    mutationFn: (id: string) => wishlistApi.moveToCart(id),
    onSuccess: ({ wishlist, cart }) => {
      queryClient.setQueryData(queryKeys.wishlist, wishlist);
      setCart(cart);
    },
  });

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-[clamp(26px,3vw,36px)] font-extrabold tracking-[-0.035em]">Wishlist</h1>
        {data && data.items.length > 0 ? (
          <span className="text-sm text-gray-500">
            {data.items.length} saved · we’ll email you when prices drop
          </span>
        ) : null}
      </div>
      {error ? <Alert tone="error">{error.message}</Alert> : null}
      {move.error ? <Alert tone="error">{move.error.message}</Alert> : null}
      {isLoading ? <Spinner /> : null}
      {data && data.items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white px-6 py-12 text-center">
          <h2 className="text-xl font-extrabold">Your wishlist is empty</h2>
          <p className="max-w-sm text-gray-500">
            Tap ♡ on a product to keep it here. We email you when a saved item gets cheaper.
          </p>
          <Link
            href="/products"
            className="mt-1 rounded-2xl bg-brand-600 px-6 py-3.5 font-bold text-white hover:text-white"
          >
            Browse products
          </Link>
        </div>
      ) : null}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(clamp(150px,18vw,210px),1fr))] gap-3">
        {data?.items.map((i) => {
          const canMove = !i.unavailable && i.inStock;
          return (
            <div key={i.id} className="flex flex-col gap-2 rounded-2xl bg-white p-2">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
                <Link href={`/products/${i.slug}`} className="block h-full">
                  {i.imageUrl ? (
                    <img
                      src={i.imageUrl}
                      alt=""
                      className="h-full w-full object-contain p-3 mix-blend-multiply"
                    />
                  ) : null}
                </Link>
                {i.priceDropped ? (
                  <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-tint-mint px-[9px] py-1 text-xs font-extrabold text-emerald-800">
                    Price dropped
                  </span>
                ) : null}
                <button
                  type="button"
                  aria-label="Remove from wishlist"
                  disabled={remove.isPending && remove.variables === i.id}
                  onClick={() => remove.mutate(i.id)}
                  className="absolute right-2 top-2 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white text-base text-rose-600 shadow-[0_2px_8px_rgba(27,24,48,.12)]"
                >
                  ♥
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-1 px-1.5">
                <Link
                  href={`/products/${i.slug}`}
                  className="line-clamp-2 min-h-[39px] text-sm hover:text-brand-600"
                >
                  {i.name}
                  {i.variantName ? ` (${i.variantName})` : ''}
                </Link>
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <span className="text-[17px] font-extrabold">
                    {formatMoney(i.price, i.currency)}
                  </span>
                  {i.priceDropped && i.priceAtAdd !== null ? (
                    <span className="text-xs text-gray-500 line-through">
                      {formatMoney(i.priceAtAdd, i.currency)}
                    </span>
                  ) : null}
                </div>
                <span
                  className={cn(
                    'text-xs font-semibold',
                    canMove ? 'text-emerald-700' : 'text-amber-700',
                  )}
                >
                  {i.unavailable ? 'No longer available' : i.inStock ? 'In stock' : 'Out of stock'}
                </span>
              </div>
              <button
                type="button"
                disabled={!canMove || (move.isPending && move.variables === i.id)}
                onClick={() => move.mutate(i.id)}
                className={cn(
                  'h-10 rounded-[14px] text-sm font-bold',
                  canMove
                    ? 'bg-brand-600 text-white hover:bg-brand-700'
                    : 'bg-gray-100 text-gray-500',
                )}
              >
                {move.isPending && move.variables === i.id ? 'Moving…' : 'Move to cart'}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
