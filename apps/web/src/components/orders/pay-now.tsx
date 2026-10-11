'use client';

import { useMutation } from '@tanstack/react-query';
import { PAYMENT_METHOD_LABELS, type OrderDto } from '@ecommerce/types';
import { Alert, Button, formatDateTime, formatMoney } from '@ecommerce/ui';
import { paymentsApi } from '@/lib/api-client';

/** Unpaid online order: explain the deadline and reopen the gateway page. */
export function PayNow({ order }: { order: OrderDto }) {
  const pay = useMutation({
    // The checkout email proves ownership for guests; signed-in owners are recognised by cookie.
    mutationFn: () => paymentsApi.payOrder(order.orderNumber, { email: order.email }),
    onSuccess: (session) => window.location.assign(session.redirectUrl),
  });
  return (
    <Alert tone="warning" title="Waiting for your payment">
      <div className="space-y-3">
        <p>
          Pay {formatMoney(order.grandTotal, order.currency)} by{' '}
          {PAYMENT_METHOD_LABELS[order.paymentMethod].toLowerCase()}
          {order.paymentExpiresAt
            ? ` before ${formatDateTime(order.paymentExpiresAt)}, otherwise the order is cancelled automatically.`
            : '.'}
        </p>
        {pay.error ? <p className="text-red-700">{pay.error.message}</p> : null}
        <Button size="sm" loading={pay.isPending} onClick={() => pay.mutate()}>
          Pay now
        </Button>
      </div>
    </Alert>
  );
}
