import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Reviews' };

export default function Page() {
  return <PagePlaceholder title="Reviews" features={['Reply to product reviews']} />;
}
