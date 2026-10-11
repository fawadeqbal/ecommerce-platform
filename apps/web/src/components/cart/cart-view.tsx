'use client';

/* eslint-disable @next/next/no-img-element -- images are served from object storage */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { CART_PROBLEM_LABELS, type CartItemDto } from '@ecommerce/types';
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
import { useCart, useMe, useSetCart } from '@/hooks/use-cart';
import { cartApi, queryKeys } from '@/lib/api-client';

export function CartView() {
  const { data: cart, error, isLoading } = useCart();
  const { data: me } = useMe();
  const setCart = useSetCart();
  const queryClient = useQueryClient();

  const saved = useQuery({
    queryKey: queryKeys.savedItems,
    queryFn: cartApi.saved,
    enabled: Boolean(me),
  });

  const mutate = useMutation({
    mutationFn: (
      action:
        | { kind: 'qty'; item: CartItemDto; quantity: number }
        | { kind: 'remove' | 'save'; item: CartItemDto },
    ) => {
      if (action.kind === 'qty')
        return cartApi.update(action.item.id, { quantity: action.quantity });
      if (action.kind === 'save') return cartApi.saveForLater(action.item.id);
      return cartApi.remove(action.item.id);
    },
    onSuccess: async (next, action) => {
      setCart(next);
      if (action.kind === 'save')
        await queryClient.invalidateQueries({ queryKey: queryKeys.savedItems });
    },
  });

  const moveToCart = useMutation({
    mutationFn: (savedId: string) => cartApi.moveToCart(savedId),
    onSuccess: async (next) => {
      setCart(next);
      await queryClient.invalidateQueries({ queryKey: queryKeys.savedItems });
    },
  });

  if (isLoading) return <Spinner className="mx-auto max-w-5xl p-8" />;
  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Alert tone="error" title="Could not load your cart">
          {error.message}
        </Alert>
      </div>
    );
  }

  const empty = !cart || cart.itemCount === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Your cart</h1>
      {mutate.error ? (
        <Alert tone="error" className="mb-4">
          {mutate.error.message}
        </Alert>
      ) : null}

      {empty ? (
        <Card>
          <EmptyState
            title="Your cart is empty"
            description="Find something you love and add it here."
            action={
              <Link href="/products" className={buttonStyles()}>
                Start shopping
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {cart.groups.map((group) => (
              <Card key={group.vendor.id} className="p-0">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 text-sm">
                  <span>
                    Sold by <span className="font-semibold text-gray-900">{group.vendor.name}</span>
                  </span>
                  <span className="text-gray-500">Shipped separately</span>
                </div>
                <ul className="divide-y divide-gray-100">
                  {group.items.map((item) => (
                    <li key={item.id} className="flex gap-4 px-5 py-4">
                      <Link
                        href={`/products/${item.productSlug}`}
                        className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white"
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="h-full w-full object-contain p-1"
                          />
                        ) : null}
                      </Link>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex justify-between gap-4">
                          <div>
                            <Link
                              href={`/products/${item.productSlug}`}
                              className="font-medium text-gray-900 hover:text-brand-700"
                            >
                              {item.productName}
                            </Link>
                            {item.variantName ? (
                              <p className="text-sm text-gray-500">{item.variantName}</p>
                            ) : null}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatMoney(item.lineTotal, cart.currency)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatMoney(item.unitPrice, cart.currency)} each
                            </p>
                          </div>
                        </div>
                        {item.problems.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {item.problems.map((p) => (
                              <Badge key={p} tone={p === 'PRICE_CHANGED' ? 'yellow' : 'red'}>
                                {p === 'PRICE_CHANGED' && item.previousUnitPrice !== null
                                  ? `Price changed from ${formatMoney(item.previousUnitPrice, cart.currency)}`
                                  : p === 'INSUFFICIENT_STOCK'
                                    ? `Only ${item.available} available`
                                    : CART_PROBLEM_LABELS[p]}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-sm">
                          <div className="flex items-center rounded-lg border border-gray-300">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              className="px-3 py-1 disabled:opacity-40"
                              disabled={mutate.isPending}
                              onClick={() =>
                                mutate.mutate({ kind: 'qty', item, quantity: item.quantity - 1 })
                              }
                            >
                              −
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              className="px-3 py-1 disabled:opacity-40"
                              disabled={mutate.isPending || item.quantity >= item.available}
                              onClick={() =>
                                mutate.mutate({ kind: 'qty', item, quantity: item.quantity + 1 })
                              }
                            >
                              +
                            </button>
                          </div>
                          {item.problems.includes('INSUFFICIENT_STOCK') && item.available > 0 ? (
                            <button
                              type="button"
                              className="text-brand-700 hover:underline"
                              onClick={() =>
                                mutate.mutate({ kind: 'qty', item, quantity: item.available })
                              }
                            >
                              Set to {item.available}
                            </button>
                          ) : null}
                          {me ? (
                            <button
                              type="button"
                              className="text-gray-600 hover:text-gray-900"
                              onClick={() => mutate.mutate({ kind: 'save', item })}
                            >
                              Save for later
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="text-red-600 hover:underline"
                            onClick={() => mutate.mutate({ kind: 'remove', item })}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <aside>
            <Card className="sticky top-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({cart.itemCount} items)</span>
                <span className="font-semibold">{formatMoney(cart.subtotal, cart.currency)}</span>
              </div>
              <p className="text-xs text-gray-500">
                Shipping, taxes and discounts are calculated at checkout.
              </p>
              {!cart.canCheckout ? (
                <Alert tone="warning">Fix the highlighted items to continue.</Alert>
              ) : null}
              {cart.canCheckout ? (
                <Link
                  href="/checkout"
                  className={buttonStyles({ size: 'lg', className: 'w-full' })}
                >
                  Proceed to checkout
                </Link>
              ) : (
                <Button className="w-full" size="lg" disabled>
                  Proceed to checkout
                </Button>
              )}
              {!me ? (
                <p className="text-center text-xs text-gray-500">
                  <Link href="/login?next=/cart" className="text-brand-700 hover:underline">
                    Sign in
                  </Link>{' '}
                  to save items for later. Your cart is kept.
                </p>
              ) : null}
            </Card>
          </aside>
        </div>
      )}

      {me && saved.data && saved.data.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Saved for later ({saved.data.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {saved.data.map((s) => (
              <Card key={s.id} className="flex gap-3 p-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                  {s.imageUrl ? (
                    <img src={s.imageUrl} alt="" className="h-full w-full object-contain p-1" />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col text-sm">
                  <Link
                    href={`/products/${s.productSlug}`}
                    className="font-medium text-gray-900 hover:text-brand-700"
                  >
                    {s.productName}
                  </Link>
                  {s.variantName ? <span className="text-gray-500">{s.variantName}</span> : null}
                  <span className="font-semibold">{formatMoney(s.price, s.currency)}</span>
                  <div className="mt-2 flex gap-3">
                    <button
                      type="button"
                      className="text-brand-700 hover:underline disabled:text-gray-400"
                      disabled={s.available <= 0 || moveToCart.isPending}
                      onClick={() => moveToCart.mutate(s.id)}
                    >
                      {s.available > 0 ? 'Move to cart' : 'Out of stock'}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {moveToCart.error ? (
            <Alert tone="error" className="mt-3">
              {moveToCart.error.message}
            </Alert>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
