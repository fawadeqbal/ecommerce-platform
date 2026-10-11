import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Seller sign in' };

export default function Page() {
  return <PagePlaceholder title="Seller sign in" features={['Email + password']} />;
}
