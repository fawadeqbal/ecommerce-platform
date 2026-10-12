'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardTitle, buttonStyles, formatDateTime } from '@ecommerce/ui';
import type { OrderDto } from '@ecommerce/types';
import { documentsApi, queryKeys } from '@/lib/api-client';

/** Signed-in customer: invoice PDF and messages from the store / sellers about this order. */
export function OrderDocuments({ order }: { order: OrderDto }) {
  const { data: notes } = useQuery({
    queryKey: queryKeys.orderNotes('customer', order.orderNumber),
    queryFn: () => documentsApi.customerNotes(order.orderNumber),
  });
  const canInvoice = order.status !== 'PENDING_PAYMENT' && order.status !== 'CANCELLED';
  return (
    <div className="space-y-4">
      {canInvoice ? (
        <a
          href={documentsApi.customerInvoiceUrl(order.orderNumber)}
          target="_blank"
          rel="noreferrer"
          className={buttonStyles({ variant: 'outline', size: 'sm' })}
        >
          Download invoice (PDF)
        </a>
      ) : null}
      {notes?.length ? (
        <Card className="space-y-3 text-sm">
          <CardTitle>Messages about your order</CardTitle>
          <ul className="space-y-2">
            {notes.map((n) => (
              <li key={n.id}>
                <p className="text-xs text-gray-500">
                  {n.from} · {formatDateTime(n.createdAt)}
                </p>
                <p className="whitespace-pre-line text-gray-800">{n.content}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
