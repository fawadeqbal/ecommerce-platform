import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Loyalty & referrals' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Loyalty & referrals"
      features={['Points balance and history', 'Tier progress', 'Referral link']}
    />
  );
}
