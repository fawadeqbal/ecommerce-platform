import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Analytics' };

export default function Page() {
  return (
    <PagePlaceholder title="Analytics" features={['Sales, top products, views, conversion']} />
  );
}
