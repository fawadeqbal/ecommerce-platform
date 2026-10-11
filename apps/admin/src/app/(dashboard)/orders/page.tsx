import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Orders' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Orders"
      features={['All orders with filters and search', 'Manual order creation']}
    />
  );
}
