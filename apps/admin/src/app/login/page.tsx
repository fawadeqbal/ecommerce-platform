import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Admin sign in' };

export default function Page() {
  return (
    <PagePlaceholder title="Admin sign in" features={['Email + password', 'Staff roles only']} />
  );
}
