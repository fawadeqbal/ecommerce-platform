'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Alert, Button } from '@ecommerce/ui';
import { queryKeys, toolsApi } from '@/lib/api-client';

/** Puts this order's items back in the cart (what is still available), then opens the cart. */
export function BuyAgain({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const run = useMutation({
    mutationFn: () => toolsApi.reorder(orderNumber),
    onSuccess: async (r) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      if (r.added > 0 && r.skipped.length === 0) router.push('/cart');
    },
  });
  return (
    <div className="space-y-2">
      <Button size="sm" variant="outline" loading={run.isPending} onClick={() => run.mutate()}>
        Buy again
      </Button>
      {run.data && (run.data.skipped.length > 0 || run.data.added === 0) ? (
        <Alert tone={run.data.added ? 'warning' : 'error'}>
          {run.data.added
            ? `${run.data.added} item(s) added to your cart. `
            : 'Nothing could be added. '}
          Not added: {run.data.skipped.map((s) => `${s.name} (${s.reason})`).join(', ')}.
          {run.data.added ? (
            <button
              type="button"
              className="ml-1 font-medium underline"
              onClick={() => router.push('/cart')}
            >
              Go to cart
            </button>
          ) : null}
        </Alert>
      ) : null}
      {run.error ? <Alert tone="error">{run.error.message}</Alert> : null}
    </div>
  );
}
