import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Inventory' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Inventory"
      features={['Stock per variant per warehouse', 'Low-stock thresholds', 'Adjustment history']}
    />
  );
}
