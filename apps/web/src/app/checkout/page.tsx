import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Checkout' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Checkout"
      features={[
        'Guest or logged-in checkout',
        'Address entry / selection',
        'Shipping method per vendor',
        'Payment: online gateway, bank transfer, Cash on Delivery',
        'Apply coupons, gift cards, loyalty points',
        'Order review and place order (idempotent)',
      ]}
    />
  );
}
