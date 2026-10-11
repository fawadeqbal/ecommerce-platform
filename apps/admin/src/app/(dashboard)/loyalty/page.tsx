import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Loyalty & referrals' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Loyalty & referrals"
      features={['Earning and redemption rules', 'Tiers and benefits', 'Referral rewards']}
    />
  );
}
