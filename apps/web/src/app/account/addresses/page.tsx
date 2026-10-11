import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Addresses' };

export default function Page() {
  return <PagePlaceholder title="Addresses" features={['Saved addresses with default']} />;
}
