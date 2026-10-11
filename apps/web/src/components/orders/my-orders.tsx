'use client';

/* eslint-disable @next/next/no-img-element -- images are served from object storage */
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import {
  Alert,
  Card,
  EmptyState,
  Pagination,
  Spinner,
  buttonStyles,
  formatDate,
  formatMoney,
} from '@ecommerce/ui';
import { ordersApi, queryKeys } from '@/lib/api-client';
import { OrderStatusBadge } from './order-status-badge';

export function MyOrders() {
  const [page, setPage] = useState(1);
  const params = { page };
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.orders.mine(params),
    queryFn: () => ordersApi.mine({ ...params, limit: 10 }),
    placeholderData: keepPreviousData,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My orders</h1>
      {error ? (
        <Alert tone="error" title="Could not load your orders">
          {error.message}
        </Alert>
      ) : null}
      {isLoading ? <Spinner /> : null}
      {data && data.items.length === 0 ? (
        <Card>
          <EmptyState
            title="No orders yet"
            description="When you place an order it will show up here."
            action={
              <Link href="/products" className={buttonStyles()}>
                Start shopping
              </Link>
            }
          />
        </Card>
      ) : null}
      <div className="space-y-3">
        {data?.items.map((o) => (
          <Link
            key={o.id}
            href={`/account/orders/${encodeURIComponent(o.orderNumber)}`}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-brand-300"
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
              {o.imageUrl ? (
                <img src={o.imageUrl} alt="" className="h-full w-full object-contain p-1" />
              ) : null}
            </div>
            <div className="flex-1 text-sm">
              <p className="font-mono font-semibold text-gray-900">{o.orderNumber}</p>
              <p className="text-gray-500">
                {formatDate(o.placedAt)} · {o.itemCount} {o.itemCount === 1 ? 'item' : 'items'}
                {o.vendorCount > 1 ? ` · ${o.vendorCount} sellers` : ''}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="font-semibold text-gray-900">{formatMoney(o.grandTotal, o.currency)}</p>
              <OrderStatusBadge status={o.status} />
            </div>
          </Link>
        ))}
      </div>
      {data ? (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          total={data.meta.total}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
