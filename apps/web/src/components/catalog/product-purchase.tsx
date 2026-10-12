'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { MAX_LINE_QUANTITY, findVariant, type StorefrontProductDetail } from '@ecommerce/types';
import { Alert, Button, cn } from '@ecommerce/ui';
import { useSetCart } from '@/hooks/use-cart';
import { NotifyMe } from '@/components/wishlist/notify-me';
import { WishlistButton } from '@/components/wishlist/wishlist-button';
import { cartApi } from '@/lib/api-client';
import { haptic, toast } from '@/lib/toast';
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

  const router = useRouter();
  const add = useMutation({
    mutationFn: () => cartApi.add({ variantId: variant!.id, quantity }),
    onSuccess: (cart) => {
      setCart(cart);
      setAdded(true);
      haptic();
      toast.success(`${quantity > 1 ? `${quantity} × ` : ''}${product.name} added`, {
        action: { label: 'View cart', href: '/cart' },
      });
    },
  });

  // Buy now: add this item and go straight to checkout.
  const buyNow = useMutation({
    mutationFn: () => cartApi.add({ variantId: variant!.id, quantity }),
    onSuccess: (cart) => {
      setCart(cart);
      router.push('/checkout');
    },
  });

  const price = variant?.price ?? product.price;
  const compareAt = variant ? variant.compareAtPrice : product.compareAtPrice;

  const save = compareAt && compareAt > price ? compareAt - price : 0;
  const soldOut = !variant || available <= 0;

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-1.5 rounded-3xl bg-white px-5 py-[18px]">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <span className="text-[clamp(30px,3.4vw,40px)] font-extrabold tracking-heading text-brand-600">
            <Money amount={price} currency={product.currency} />
          </span>
          {compareAt && save > 0 ? (
            <>
              <span className="text-lg text-gray-500 line-through">
                <Money amount={compareAt} currency={product.currency} />
              </span>
              <span className="rounded-full bg-tint-mint px-2.5 py-1 text-[13px] font-bold text-emerald-800">
                Save <Money amount={save} currency={product.currency} />
              </span>
            </>
          ) : null}
        </div>
        <span className="text-[13px] text-gray-500">
          Cash on delivery available · Earn loyalty points on this order
        </span>
      </div>

      {product.options.map((option) => {
        const current = option.values.find((v) => v.id === selected[option.attributeId]);
        return (
          <div key={option.attributeId} className="flex flex-col gap-2.5">
            <p className="text-sm font-semibold">
              {option.name}:{' '}
              <span className="font-normal text-gray-600">{current?.label ?? 'Choose'}</span>
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
                      'inline-flex items-center gap-2 rounded-[14px] border-2 text-sm transition-colors',
                      value.swatch ? 'px-3.5 py-2 font-semibold' : 'px-[18px] py-2.5 font-bold',
                      on
                        ? 'border-brand-600 bg-brand-100 text-brand-700'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300',
                      !inStock && 'text-gray-400 line-through',
                    )}
                  >
                    {value.swatch ? (
                      <span
                        className="h-[18px] w-[18px] rounded-full border border-gray-900/15"
                        style={{ backgroundColor: value.swatch }}
                      />
                    ) : null}
                    {value.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <p
        className={cn(
          'text-sm font-bold',
          soldOut ? 'text-red-600' : available <= 5 ? 'text-amber-700' : 'text-emerald-700',
        )}
      >
        {!variant
          ? 'This combination is not available'
          : available <= 0
            ? 'Out of stock'
            : available <= 5
              ? `Only ${available} left in stock`
              : 'In stock · ready to ship'}
      </p>

      <div className="flex flex-wrap gap-2.5">
        <div className="flex h-[54px] items-center rounded-2xl bg-white">
          <button
            type="button"
            aria-label="Decrease quantity"
            className="h-[54px] w-12 text-[22px] disabled:opacity-40"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="w-8 text-center text-base font-bold" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            className="h-[54px] w-12 text-[22px] disabled:opacity-40"
            disabled={quantity >= Math.min(available, MAX_LINE_QUANTITY)}
            onClick={() => setQuantity((q) => q + 1)}
          >
            +
          </button>
        </div>
        <Button
          className="h-[54px] flex-[1_1_200px] rounded-2xl text-base font-bold"
          disabled={soldOut}
          loading={add.isPending}
          onClick={() => add.mutate()}
        >
          {added ? 'Added ✓' : 'Add to cart'}
        </Button>
        <button
          type="button"
          disabled={soldOut || buyNow.isPending}
          onClick={() => buyNow.mutate()}
          className="flex h-[54px] flex-[1_1_160px] items-center justify-center rounded-2xl bg-accent text-base font-bold text-gray-900 hover:bg-accent-strong disabled:opacity-50"
        >
          {buyNow.isPending ? 'One moment…' : 'Buy now'}
        </button>
        <WishlistButton
          productId={product.id}
          variantId={variant?.id}
          slug={product.slug}
          variant="square"
        />
      </div>

      {variant && available <= 0 ? <NotifyMe key={variant.id} variantId={variant.id} /> : null}

      {add.error || buyNow.error ? (
        <Alert tone="error">{(add.error ?? buyNow.error)?.message}</Alert>
      ) : null}
      {added ? (
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl bg-tint-mint px-4 py-3 text-sm text-emerald-900">
          <b>Added to your cart</b>
          <Link href="/cart" className="font-bold text-emerald-900 underline">
            View cart →
          </Link>
        </div>
      ) : null}

      {variant ? <p className="text-xs text-gray-500">SKU: {variant.sku}</p> : null}
    </div>
  );
}
