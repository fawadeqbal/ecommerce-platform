import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Seller onboarding' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Seller onboarding"
      features={['Application status', 'Complete store profile and payout details']}
    />
  );
}
