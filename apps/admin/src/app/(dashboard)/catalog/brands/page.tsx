import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Brands' };

export default function Page() {
  return <PagePlaceholder title="Brands" features={['Brand CRUD']} />;
}
