import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Vendor dashboard' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Vendor dashboard"
      features={['Sales, orders, earnings at a glance', 'Low-stock alerts', 'Pending orders']}
    />
  );
}
