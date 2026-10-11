import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Gift cards' };

export default function Page() {
  return <PagePlaceholder title="Gift cards" features={['Issue, balance, redemption history']} />;
}
