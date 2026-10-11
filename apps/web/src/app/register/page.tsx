import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Create account' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Create account"
      features={['Registration form', 'Email verification']}
    />
  );
}
