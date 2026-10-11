import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Subscribers' };

export default function Page() {
  return <PagePlaceholder title="Subscribers" features={['Newsletter subscribers list']} />;
}
