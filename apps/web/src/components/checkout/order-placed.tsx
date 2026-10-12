'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PAYMENT_METHOD_LABELS } from '@ecommerce/types';
import { Card, buttonStyles, formatMoney } from '@ecommerce/ui';
import { useMe } from '@/hooks/use-cart';
import { ordersApi, queryKeys } from '@/lib/api-client';

export function OrderPlaced() {
  const orderNumber = useSearchParams().get('order') ?? '';
  const me = useMe();
  // Checkout put the order in the cache; signed-in customers can also reload it after a refresh.
  const { data: order } = useQuery({
    queryKey: queryKeys.orders.detail(orderNumber),
    queryFn: () => ordersApi.get(orderNumber),
    enabled: Boolean(orderNumber && me.data),
    retry: false,
  });

  const detailHref = me.data
    ? `/account/orders/${encodeURIComponent(orderNumber)}`
    : `/track-order?order=${encodeURIComponent(orderNumber)}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card className="space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
          ✓
        </div>
        <div>
          <h1 className="text-[clamp(26px,3vw,36px)] font-extrabold tracking-[-0.035em] text-gray-900">
            Thank you, your order is placed!
          </h1>
          {orderNumber ? (
            <p className="mt-2 text-gray-600">
              Order number{' '}
              <span className="font-mono font-semibold text-gray-900">{orderNumber}</span>
            </p>
          ) : null}
        </div>

        {order ? (
          <div className="space-y-1 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
            <p>
              A confirmation has been sent to <span className="font-medium">{order.email}</span>.
            </p>
            <p>
              {order.paymentMethod === 'COD'
                ? `Please keep ${formatMoney(order.grandTotal, order.currency)} ready to pay on delivery.`
                : `${PAYMENT_METHOD_LABELS[order.paymentMethod]}: ${formatMoney(order.grandTotal, order.currency)}`}
            </p>
            {order.vendorOrders.length > 1 ? (
              <p>
                Your items come from {order.vendorOrders.length} sellers and may arrive separately.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            We have emailed you a confirmation with the details.
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          {orderNumber ? (
            <Link href={detailHref} className={buttonStyles()}>
              {me.data ? 'View order' : 'Track order'}
            </Link>
          ) : null}
          <Link href="/products" className={buttonStyles({ variant: 'outline' })}>
            Continue shopping
          </Link>
        </div>
      </Card>
    </div>
  );
}
