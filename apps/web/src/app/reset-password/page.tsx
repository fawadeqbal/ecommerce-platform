import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Reset password' };

export default function Page() {
  return (
    <PagePlaceholder title="Reset password" features={['Set new password from emailed token']} />
  );
}
