'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PAYMENT_METHOD_LABELS } from '@ecommerce/types';
import {
  Alert,
  Button,
  Card,
  Spinner,
  buttonStyles,
  formatDateTime,
  formatMoney,
} from '@ecommerce/ui';
import { useMe } from '@/hooks/use-cart';
import { paymentsApi, queryKeys } from '@/lib/api-client';

const POLL_MS = 2000;
const POLL_LIMIT_MS = 60_000;

/** Where the gateway sends the customer back. The webhook decides; this page only reads the result. */
export function PaymentReturn() {
  const paymentId = useSearchParams().get('payment') ?? '';
  const me = useMe();
  const queryClient = useQueryClient();
  const [startedAt] = useState(() => Date.now());

  const { data, error } = useQuery({
    queryKey: queryKeys.payments.status(paymentId),
    queryFn: () => paymentsApi.status(paymentId),
    enabled: Boolean(paymentId),
    // A real gateway's webhook can arrive a few seconds after the redirect.
    refetchInterval: (q) =>
      q.state.data?.attemptStatus === 'PENDING' && Date.now() - startedAt < POLL_LIMIT_MS
        ? POLL_MS
        : false,
  });

  useEffect(() => {
    if (data?.orderPaymentStatus === 'PAID') {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    }
  }, [data?.orderPaymentStatus, queryClient]);

  const retry = useMutation({
    mutationFn: () => paymentsApi.retry(paymentId),
    onSuccess: (session) => window.location.assign(session.redirectUrl),
  });

  const orderHref = data
    ? me.data
      ? `/account/orders/${encodeURIComponent(data.orderNumber)}`
      : `/track-order?order=${encodeURIComponent(data.orderNumber)}`
    : '/';

  let body: React.ReactNode = <Spinner />;
  if (!paymentId || error) {
    body = (
      <Alert tone="error" title="We could not find this payment">
        {error?.message ?? 'The link is incomplete.'}
      </Alert>
    );
  } else if (data && (data.orderPaymentStatus === 'PAID' || data.attemptStatus === 'PAID')) {
    body = (
      <>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
          ✓
        </div>
        <div>
          <h1 className="text-[clamp(26px,3vw,36px)] font-extrabold tracking-[-0.035em] text-gray-900">
            Payment received, thank you!
          </h1>
          <p className="mt-2 text-gray-600">
            Order <span className="font-mono font-semibold text-gray-900">{data.orderNumber}</span>{' '}
            is confirmed. {formatMoney(data.amount, data.currency)} paid by{' '}
            {PAYMENT_METHOD_LABELS[data.method].toLowerCase()}.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            A confirmation has been sent to {data.email}.
          </p>
        </div>
        {data.orderStatus === 'CANCELLED' ? (
          <Alert tone="warning">
            The payment arrived after the order was closed, so it is being refunded in full.
          </Alert>
        ) : null}
      </>
    );
  } else if (data && data.attemptStatus === 'PENDING') {
    body = (
      <>
        <Spinner />
        <h1 className="text-xl font-semibold text-gray-900">Confirming your payment…</h1>
        <p className="text-sm text-gray-600">
          This usually takes a few seconds. You can also check your order page later.
        </p>
      </>
    );
  } else if (data) {
    body = (
      <>
        <h1 className="text-[clamp(26px,3vw,36px)] font-extrabold tracking-[-0.035em] text-gray-900">
          {data.attemptStatus === 'CANCELLED' ? 'Payment cancelled' : 'Payment failed'}
        </h1>
        {data.canRetry ? (
          <p className="text-gray-600">
            Your order <span className="font-mono">{data.orderNumber}</span> is reserved
            {data.expiresAt ? ` until ${formatDateTime(data.expiresAt)}` : ''}. You can try again.
          </p>
        ) : (
          <Alert tone="warning">
            The time to pay has run out and the order was cancelled. Nothing was charged.
          </Alert>
        )}
        {retry.error ? <Alert tone="error">{retry.error.message}</Alert> : null}
        {data.canRetry ? (
          <Button size="lg" loading={retry.isPending} onClick={() => retry.mutate()}>
            Try again
          </Button>
        ) : null}
      </>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card className="space-y-5 text-center">
        {body}
        {data ? (
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={orderHref} className={buttonStyles({ variant: 'outline' })}>
              {me.data ? 'View order' : 'Track order'}
            </Link>
            <Link href="/products" className={buttonStyles({ variant: 'outline' })}>
              Continue shopping
            </Link>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
