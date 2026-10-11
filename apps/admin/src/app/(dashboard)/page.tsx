import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Dashboard' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Dashboard"
      features={[
        'KPIs: revenue, orders, AOV, conversion, new customers',
        'Top products, top vendors, abandoned carts',
        'Date range filter and comparison',
      ]}
    />
  );
}
