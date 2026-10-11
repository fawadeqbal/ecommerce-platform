import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Forgot password' };

export default function Page() {
  return <PagePlaceholder title="Forgot password" features={['Request reset link by email']} />;
}
