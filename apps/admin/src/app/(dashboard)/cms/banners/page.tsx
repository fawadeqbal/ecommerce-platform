import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Banners' };

export default function Page() {
  return <PagePlaceholder title="Banners" features={['Banners by placement with scheduling']} />;
}
