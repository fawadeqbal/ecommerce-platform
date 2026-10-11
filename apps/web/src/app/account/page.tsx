import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'My account' };

export default function Page() {
  return (
    <PagePlaceholder
      title="My account"
      features={['Profile overview', 'Recent orders', 'Loyalty balance']}
    />
  );
}
