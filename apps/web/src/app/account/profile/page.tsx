import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Profile' };

export default function Page() {
  return <PagePlaceholder title="Profile" features={['Edit name, phone, password']} />;
}
