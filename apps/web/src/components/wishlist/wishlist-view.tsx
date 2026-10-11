'use client';

/* eslint-disable @next/next/no-img-element -- images are served from object storage */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Spinner,
  buttonStyles,
  formatMoney,
} from '@ecommerce/ui';
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
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Wishlist</h1>
      {error ? <Alert tone="error">{error.message}</Alert> : null}
      {move.error ? (
        <Alert tone="error" className="mb-4">
          {move.error.message}
        </Alert>
      ) : null}
      {isLoading ? <Spinner /> : null}
      {data && data.items.length === 0 ? (
        <Card>
          <EmptyState
            title="Your wishlist is empty"
            description="Tap ♡ Save on a product to keep it here. We email you when a saved item gets cheaper."
            action={
              <Link href="/products" className={buttonStyles()}>
                Browse products
              </Link>
            }
          />
        </Card>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {data?.items.map((i) => (
          <Card key={i.id} className="flex gap-4">
            <Link
              href={`/products/${i.slug}`}
              className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              {i.imageUrl ? (
                <img src={i.imageUrl} alt="" className="h-full w-full object-contain p-1" />
              ) : null}
            </Link>
            <div className="flex flex-1 flex-col gap-1 text-sm">
              <Link
                href={`/products/${i.slug}`}
                className="font-medium text-gray-900 hover:text-brand-700"
              >
                {i.name}
                {i.variantName ? ` (${i.variantName})` : ''}
              </Link>
              <p className="text-xs text-gray-500">{i.vendorName}</p>
              <p>
                <span className="font-semibold">{formatMoney(i.price, i.currency)}</span>
                {i.priceDropped && i.priceAtAdd !== null ? (
                  <>
                    <span className="ml-2 text-gray-400 line-through">
                      {formatMoney(i.priceAtAdd, i.currency)}
                    </span>
                    <Badge tone="green" className="ml-2">
                      Price dropped
                    </Badge>
                  </>
                ) : null}
              </p>
              {i.unavailable ? (
                <Badge tone="gray">No longer available</Badge>
              ) : !i.inStock ? (
                <Badge tone="yellow">Out of stock</Badge>
              ) : null}
              <div className="mt-auto flex gap-2 pt-2">
                <Button
                  size="sm"
                  disabled={i.unavailable || !i.inStock}
                  loading={move.isPending && move.variables === i.id}
                  onClick={() => move.mutate(i.id)}
                >
                  Move to cart
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  loading={remove.isPending && remove.variables === i.id}
                  onClick={() => remove.mutate(i.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
