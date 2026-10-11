import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Verify email' };

export default function Page() {
  return <PagePlaceholder title="Verify email" features={['Confirm email from token']} />;
}
