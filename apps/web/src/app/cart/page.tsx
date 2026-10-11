import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Cart' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Cart"
      features={[
        'Update quantity, remove, save for later',
        'Items grouped by vendor',
        'Coupon and gift card',
        'Estimated shipping and tax',
        'Real-time stock/price validation',
      ]}
    />
  );
}
