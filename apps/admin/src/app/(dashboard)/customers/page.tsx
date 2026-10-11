import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Customers' };

export default function Page() {
  return (
    <PagePlaceholder title="Customers" features={['Customer list and segments', 'Block/unblock']} />
  );
}
