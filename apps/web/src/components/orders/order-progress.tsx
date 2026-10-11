import { ORDER_PROGRESS, ORDER_STATUS_LABELS, type OrderStatus } from '@ecommerce/types';
import { cn } from '@ecommerce/ui';

/** Where in ORDER_PROGRESS a status sits (paid counts as confirmed, out-for-delivery as shipped). */
function stepIndex(status: OrderStatus): number {
  if (status === 'PENDING_PAYMENT') return -1; // nothing confirmed until it is paid
  const alias: Partial<Record<OrderStatus, OrderStatus>> = {
    PAID: 'COD_CONFIRMED',
    OUT_FOR_DELIVERY: 'SHIPPED',
  };
  const index = ORDER_PROGRESS.indexOf(alias[status] ?? status);
  return index === -1 ? 0 : index;
}

export function OrderProgress({ status }: { status: OrderStatus }) {
  const current = stepIndex(status);
  return (
    <ol className="grid grid-cols-5 gap-2">
      {ORDER_PROGRESS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step} className="space-y-2">
            <div className={cn('h-1.5 rounded-full', done ? 'bg-brand-600' : 'bg-gray-200')} />
            <p className={cn('text-xs', done ? 'font-medium text-gray-900' : 'text-gray-500')}>
              {step === 'COD_CONFIRMED' ? 'Confirmed' : ORDER_STATUS_LABELS[step]}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
