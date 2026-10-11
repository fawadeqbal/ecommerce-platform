import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Earnings' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Earnings"
      features={['Gross sales, commission, net earnings', 'Downloadable reports']}
    />
  );
}
