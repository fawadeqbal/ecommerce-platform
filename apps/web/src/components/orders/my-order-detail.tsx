'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { ORDER_REASON_MIN } from '@ecommerce/types';
import { Alert, Button, ReasonDialog, Spinner } from '@ecommerce/ui';
import { ordersApi, queryKeys } from '@/lib/api-client';
import { OrderDetails } from './order-details';

export function MyOrderDetail({ orderNumber }: { orderNumber: string }) {
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState(false);
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
