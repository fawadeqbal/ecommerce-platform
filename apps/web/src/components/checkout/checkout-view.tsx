'use client';

/* eslint-disable @next/next/no-img-element -- images are served from object storage */
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  PAYMENT_METHOD_LABELS,
  checkoutFormSchema,
  checkoutFormToInput,
  emptyCheckoutForm,
  formatAddress,
  type CheckoutFormValues,
} from '@ecommerce/types';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardTitle,
  Checkbox,
  EmptyState,
  Input,
  Spinner,
  Textarea,
  buttonStyles,
  cn,
  formatMoney,
} from '@ecommerce/ui';
import { AddressInputs } from '@/components/account/address-inputs';
import { useCart, useMe } from '@/hooks/use-cart';
import { addressesApi, checkoutApi, queryKeys } from '@/lib/api-client';

function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const radioCard =
  'flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 text-sm hover:border-brand-300 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50';

export function CheckoutView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: cart, isLoading: cartLoading, error: cartError } = useCart();
  const me = useMe();
  const signedIn = Boolean(me.data);
  // One key per checkout visit: a double click or a retry after a timeout never creates two orders.
  const [idempotencyKey] = useState(newIdempotencyKey);
  const [placed, setPlaced] = useState(false);

  const addresses = useQuery({
    queryKey: queryKeys.addresses,
    queryFn: addressesApi.list,
    enabled: signedIn,
  });

  // The quote is re-fetched whenever the cart contents or prices change.
  const signature = cart
    ? cart.groups
        .flatMap((g) => g.items.map((i) => `${i.id}:${i.quantity}:${i.unitPrice}`))
        .join('|')
    : '';
  const quote = useQuery({
    queryKey: queryKeys.checkoutQuote(signature),
    queryFn: checkoutApi.quote,
    enabled: Boolean(cart && cart.itemCount > 0) && !placed,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: emptyCheckoutForm(true),
  });

  // Once we know who is checking out, switch guest/customer mode and pick the default address.
  const initialised = useRef(false);
  useEffect(() => {
    if (initialised.current || me.isPending) return;
    if (!signedIn) {
      initialised.current = true;
      setValue('isGuest', true);
      return;
    }
    if (addresses.isPending) return;
    initialised.current = true;
    const list = addresses.data ?? [];
    const preferred = list.find((a) => a.isDefault) ?? list[0];
    setValue('isGuest', false);
    setValue('addressId', preferred?.id ?? '');
  }, [me.isPending, signedIn, addresses.isPending, addresses.data, setValue]);

  const addressId = watch('addressId');

  const place = useMutation({
    mutationFn: (values: CheckoutFormValues) =>
      checkoutApi.place(checkoutFormToInput(values, idempotencyKey)),
    onSuccess: async (order) => {
      setPlaced(true);
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders.all, refetchType: 'none' });
      queryClient.setQueryData(queryKeys.orders.detail(order.orderNumber), order);
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      if (signedIn) await queryClient.invalidateQueries({ queryKey: queryKeys.addresses });
      router.replace(`/checkout/success?order=${encodeURIComponent(order.orderNumber)}`);
    },
    onError: async () => {
      // Stock or prices may have changed: refresh both so the summary explains why.
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });

  const onSubmit = handleSubmit((values) => place.mutate(values));

  if (cartLoading || me.isPending || placed) return <Spinner className="mx-auto max-w-5xl p-8" />;
  if (cartError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Alert tone="error" title="Could not load your cart">
          {cartError.message}
        </Alert>
      </div>
    );
  }
  if (!cart || cart.itemCount === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <EmptyState
            title="Your cart is empty"
            description="Add something to your cart before checking out."
            action={
              <Link href="/products" className={buttonStyles()}>
                Browse products
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  const q = quote.data;
  const savedAddresses = signedIn ? (addresses.data ?? []) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <Link href="/cart" className="text-sm text-brand-700 hover:underline">
          ← Back to cart
        </Link>
      </div>

      <form
        id="checkout-form"
        onSubmit={onSubmit}
        noValidate
        className="grid gap-8 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-6">
          <Card className="space-y-4">
            <CardTitle>Contact</CardTitle>
            {signedIn && me.data ? (
              <p className="text-sm text-gray-700">
                Signed in as <span className="font-medium">{me.data.email}</span>
              </p>
            ) : (
              <>
                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
                  hint="Your receipt and order updates go here."
                  {...register('email')}
                  error={errors.email?.message}
                />
                <p className="text-sm text-gray-600">
                  Have an account?{' '}
                  <Link
                    href="/login?next=/checkout"
                    className="font-medium text-brand-700 hover:underline"
                  >
                    Sign in
                  </Link>{' '}
                  to use saved addresses and see your orders.
                </p>
              </>
            )}
          </Card>

          <Card className="space-y-4">
            <CardTitle>Shipping address</CardTitle>
            {savedAddresses.length > 0 ? (
              <div className="space-y-2">
                {savedAddresses.map((a) => (
                  <label key={a.id} className={radioCard}>
                    <input type="radio" value={a.id} className="mt-1" {...register('addressId')} />
                    <span>
                      <span className="font-medium text-gray-900">{a.fullName}</span>
                      {a.label ? <Badge className="ml-2">{a.label}</Badge> : null}
                      {a.isDefault ? (
                        <Badge tone="blue" className="ml-2">
                          Default
                        </Badge>
                      ) : null}
                      <span className="block text-gray-600">{formatAddress(a)}</span>
                      <span className="block text-gray-500">{a.phone}</span>
                    </span>
                  </label>
                ))}
                <label className={radioCard}>
                  <input type="radio" value="" className="mt-1" {...register('addressId')} />
                  <span className="font-medium text-gray-900">Use a new address</span>
                </label>
              </div>
            ) : null}

            {addressId === '' ? (
              <div className="space-y-4">
                <AddressInputs
                  fieldProps={(name) => ({ ...register(name), error: errors[name]?.message })}
                />
                {signedIn ? (
                  <Checkbox label="Save this address to my account" {...register('saveAddress')} />
                ) : null}
              </div>
            ) : null}
          </Card>

          <Card className="space-y-4">
            <CardTitle>Payment</CardTitle>
            <label className={radioCard}>
              <input type="radio" value="COD" className="mt-1" {...register('paymentMethod')} />
              <span>
                <span className="font-medium text-gray-900">{PAYMENT_METHOD_LABELS.COD}</span>
                <span className="block text-gray-600">
                  Pay in cash when your order arrives.
                  {q && q.codFee > 0 ? ` A ${formatMoney(q.codFee, q.currency)} fee applies.` : ''}
                </span>
              </span>
            </label>
            <p className="text-xs text-gray-500">Online card payments are coming soon.</p>
          </Card>

          <Card className="space-y-2">
            <CardTitle>Order note (optional)</CardTitle>
            <Textarea
              aria-label="Order note"
              placeholder="Delivery instructions, landmarks…"
              rows={3}
              {...register('customerNote')}
              error={errors.customerNote?.message}
            />
          </Card>
        </div>

        <aside>
          <Card className="sticky top-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
            {quote.isPending ? <Spinner /> : null}
            {quote.error ? <Alert tone="error">{quote.error.message}</Alert> : null}
            {q ? (
              <>
                <div className="space-y-4">
                  {q.groups.map((g) => (
                    <div key={g.vendor.id} className="space-y-2 border-b border-gray-100 pb-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {g.vendor.name}
                      </p>
                      {g.items.map((item) => (
                        <div key={item.id} className="flex gap-3 text-sm">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt=""
                                className="h-full w-full object-contain p-0.5"
                              />
                            ) : null}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.productName}</p>
                            <p className="text-xs text-gray-500">
                              {item.variantName ? `${item.variantName} · ` : ''}Qty {item.quantity}
                            </p>
                          </div>
                          <span className="font-medium">
                            {formatMoney(item.lineTotal, q.currency)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Shipping from this seller</span>
                        <span>
                          {g.shipping === 0 ? 'Free' : formatMoney(g.shipping, q.currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <dl className="space-y-1.5 text-sm">
                  <Row label="Subtotal" value={formatMoney(q.subtotal, q.currency)} />
                  <Row
                    label="Shipping"
                    value={
                      q.shippingTotal === 0 ? 'Free' : formatMoney(q.shippingTotal, q.currency)
                    }
                  />
                  {q.discountTotal > 0 ? (
                    <Row label="Discount" value={`−${formatMoney(q.discountTotal, q.currency)}`} />
                  ) : null}
                  {q.taxTotal > 0 ? (
                    <Row label="Tax" value={formatMoney(q.taxTotal, q.currency)} />
                  ) : null}
                  {q.codFee > 0 ? (
                    <Row label="Cash on delivery fee" value={formatMoney(q.codFee, q.currency)} />
                  ) : null}
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold text-gray-900">
                    <dt>Total</dt>
                    <dd>{formatMoney(q.grandTotal, q.currency)}</dd>
                  </div>
                </dl>

                {q.freeShippingAbove > 0 ? (
                  <p className="text-xs text-gray-500">
                    Free shipping on orders over {formatMoney(q.freeShippingAbove, q.currency)} per
                    seller.
                  </p>
                ) : null}

                {q.problems.length > 0 ? (
                  <Alert tone="warning">
                    <ul className="list-disc space-y-1 pl-4">
                      {q.problems.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                    <Link href="/cart" className="mt-2 inline-block font-medium underline">
                      Review cart
                    </Link>
                  </Alert>
                ) : null}
              </>
            ) : null}

            {place.error ? <Alert tone="error">{place.error.message}</Alert> : null}

            <Button
              type="submit"
              form="checkout-form"
              size="lg"
              className={cn('w-full')}
              loading={place.isPending}
              disabled={!q?.canPlace}
            >
              Place order
            </Button>
            <p className="text-center text-xs text-gray-500">
              By placing your order you agree to our terms and returns policy.
            </p>
          </Card>
        </aside>
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-600">{label}</dt>
      <dd className="text-gray-900">{value}</dd>
    </div>
  );
}
