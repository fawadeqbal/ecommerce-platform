'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MAX_LINE_QUANTITY, findVariant, type StorefrontProductDetail } from '@ecommerce/types';
import { Alert, Button, buttonStyles, cn } from '@ecommerce/ui';
import { useSetCart } from '@/hooks/use-cart';
import { NotifyMe } from '@/components/wishlist/notify-me';
import { WishlistButton } from '@/components/wishlist/wishlist-button';
import { cartApi } from '@/lib/api-client';
import { Money } from '@/components/locale/locale-provider';

/** Option picker + quantity + add to cart. Stock and price follow the selected variant. */
export function ProductPurchase({ product }: { product: StorefrontProductDetail }) {
  const setCart = useSetCart();
  const initial =
    product.variants.find((v) => v.id === product.defaultVariantId) ?? product.variants[0];
  const [selected, setSelected] = useState<Record<string, string>>(initial?.values ?? {});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = useMemo(
    () => findVariant(product.variants, product.options, selected),
    [product, selected],
  );
  const available = variant?.available ?? 0;

  /** A value is "possible" when some variant with it (and the other current choices) is in stock. */
  const possible = (attributeId: string, valueId: string) =>
    product.variants.some(
      (v) =>
        v.available > 0 &&
        v.values[attributeId] === valueId &&
        product.options.every(
          (o) =>
            o.attributeId === attributeId || v.values[o.attributeId] === selected[o.attributeId],
        ),
    );

  const add = useMutation({
    mutationFn: () => cartApi.add({ variantId: variant!.id, quantity }),
    onSuccess: (cart) => {
      setCart(cart);
      setAdded(true);
    },
  });

  const price = variant?.price ?? product.price;
  const compareAt = variant ? variant.compareAtPrice : product.compareAtPrice;

  return (
    <div className="space-y-6">
      <div>
        <span className="text-3xl font-bold text-gray-900">
          <Money amount={price} currency={product.currency} />
        </span>
        {compareAt ? (
          <span className="ml-3 text-lg text-gray-400 line-through">
            <Money amount={compareAt} currency={product.currency} />
          </span>
        ) : null}
      </div>

      {product.options.map((option) => (
        <div key={option.attributeId}>
          <p className="mb-2 text-sm font-medium text-gray-700">
            {option.name}:{' '}
            <span className="font-normal text-gray-900">
              {option.values.find((v) => v.id === selected[option.attributeId])?.label ?? 'Choose'}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const on = selected[option.attributeId] === value.id;
              const inStock = possible(option.attributeId, value.id);
              return (
                <button
                  key={value.id}
                  type="button"
                  aria-pressed={on}
                  title={inStock ? value.label : `${value.label} (out of stock)`}
                  onClick={() => {
                    setSelected((s) => ({ ...s, [option.attributeId]: value.id }));
                    setAdded(false);
                    add.reset();
                  }}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                    on
                      ? 'border-brand-600 bg-brand-50 text-brand-800 ring-1 ring-brand-600'
                      : 'border-gray-300 hover:border-gray-400',
                    !inStock && 'text-gray-400 line-through',
                  )}
                >
                  {value.swatch ? (
                    <span
                      className="h-4 w-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: value.swatch }}
                    />
                  ) : null}
                  {value.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className={cn('text-sm font-medium', available > 0 ? 'text-green-700' : 'text-red-600')}>
        {!variant
          ? 'This combination is not available'
          : available <= 0
            ? 'Out of stock'
            : available <= 5
              ? `Only ${available} left in stock`
              : 'In stock'}
      </p>

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg border border-gray-300">
          <button
            type="button"
            aria-label="Decrease quantity"
            className="px-3 py-2 text-lg disabled:opacity-40"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-medium" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            className="px-3 py-2 text-lg disabled:opacity-40"
            disabled={quantity >= Math.min(available, MAX_LINE_QUANTITY)}
            onClick={() => setQuantity((q) => q + 1)}
          >
            +
          </button>
        </div>
        <Button
          size="lg"
          className="flex-1"
          disabled={!variant || available <= 0}
          loading={add.isPending}
          onClick={() => add.mutate()}
        >
          Add to cart
        </Button>
        <WishlistButton productId={product.id} variantId={variant?.id} slug={product.slug} />
      </div>

      {variant && available <= 0 ? <NotifyMe key={variant.id} variantId={variant.id} /> : null}

      {add.error ? <Alert tone="error">{add.error.message}</Alert> : null}
      {added ? (
        <Alert tone="success" title="Added to your cart">
          <Link href="/cart" className={buttonStyles({ size: 'sm', className: 'mt-2' })}>
            View cart
          </Link>
        </Alert>
      ) : null}

      {variant ? <p className="text-xs text-gray-500">SKU: {variant.sku}</p> : null}
    </div>
  );
}
