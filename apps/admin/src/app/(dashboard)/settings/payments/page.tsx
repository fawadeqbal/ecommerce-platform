import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Payments' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Payments"
      features={[
        'Gateways and credentials',
        'COD rules: zones, max value, fee',
        'Transaction and webhook logs',
      ]}
    />
  );
}
