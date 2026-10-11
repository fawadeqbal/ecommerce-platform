import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Categories' };

export default function Page() {
  return <PagePlaceholder title="Categories" features={['Nested categories, ordering, SEO']} />;
}
