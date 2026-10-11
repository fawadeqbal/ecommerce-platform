import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Returns' };

export default function Page() {
  return <PagePlaceholder title="Returns" features={['Return requests for own items']} />;
}
