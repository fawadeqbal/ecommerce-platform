import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Inventory' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Inventory"
      features={['Warehouses', 'Global stock view', 'Low-stock report']}
    />
  );
}
