import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Payout details' };

export default function Page() {
  return <PagePlaceholder title="Payout details" features={['Bank account details']} />;
}
