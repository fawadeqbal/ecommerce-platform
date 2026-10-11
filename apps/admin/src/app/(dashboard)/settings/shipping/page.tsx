import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Shipping' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Shipping"
      features={['Zones and rates', 'Courier integrations', 'Pickup / local delivery']}
    />
  );
}
