import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Payouts' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Payouts"
      features={['Settlement cycles', 'Mark paid', 'Payout reports']}
    />
  );
}
