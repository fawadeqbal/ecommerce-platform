'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { ORDER_REASON_MIN } from '@ecommerce/types';
import { Alert, Button, ReasonDialog, Spinner } from '@ecommerce/ui';
import { ordersApi, queryKeys } from '@/lib/api-client';
import { ReturnDialog } from '@/components/returns/return-dialog';
import { OrderDetails } from './order-details';

export function MyOrderDetail({ orderNumber }: { orderNumber: string }) {
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState(false);
  const [returning, setReturning] = useState<string | null>(null);
  const { data: order, error } = useQuery({
    queryKey: queryKeys.orders.detail(orderNumber),
    queryFn: () => ordersApi.get(orderNumber),
  });

  const cancel = useMutation({
    mutationFn: (reason: string) => ordersApi.cancel(orderNumber, { reason }),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders.all, refetchType: 'none' });
      queryClient.setQueryData(queryKeys.orders.detail(orderNumber), updated);
      setCancelling(false);
    },
  });

  if (error) {
    return (
      <Alert tone="error" title="Could not load this order">
        {error.message}
      </Alert>
    );
  }
  if (!order) return <Spinner />;
  const returnable = order.vendorOrders.filter((v) =>
    v.items.some((i) => i.returnableQuantity > 0),
  );
  const returningFrom = order.vendorOrders.find((v) => v.id === returning);

  return (
    <div className="space-y-4">
      <Link href="/account/orders" className="text-sm text-brand-700 hover:underline">
        ← All orders
      </Link>
      <OrderDetails
        order={order}
        actions={
          order.canCancel ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                cancel.reset();
                setCancelling(true);
              }}
            >
              Cancel order
            </Button>
          ) : null
        }
      />
      {returnable.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm">
          <span className="text-gray-700">Something wrong with your items?</span>
          {returnable.map((v) => (
            <Button key={v.id} size="sm" variant="outline" onClick={() => setReturning(v.id)}>
              Return items{order.vendorOrders.length > 1 ? ` from ${v.vendor.name}` : ''}
            </Button>
          ))}
          <Link href="/account/returns" className="text-brand-700 hover:underline">
            My returns
          </Link>
        </div>
      ) : null}
      {returningFrom ? (
        <ReturnDialog
          orderNumber={order.orderNumber}
          currency={order.currency}
          vendorOrder={returningFrom}
          onClose={() => setReturning(null)}
        />
      ) : null}
      <ReasonDialog
        open={cancelling}
        title="Cancel this order?"
        description="Items not yet shipped are cancelled and you will not be charged."
        label="Why are you cancelling?"
        minLength={ORDER_REASON_MIN}
        confirmLabel="Cancel order"
        loading={cancel.isPending}
        error={cancel.error?.message}
        onConfirm={(reason) => cancel.mutate(reason)}
        onClose={() => setCancelling(false)}
      />
    </div>
  );
}
