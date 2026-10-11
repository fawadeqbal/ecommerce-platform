import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Reports' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Reports"
      features={[
        'Sales, orders, products, categories, vendors, customers, coupons, taxes, refunds, inventory',
        'Abandoned cart report',
        'CSV/Excel export, scheduled report emails',
      ]}
    />
  );
}
