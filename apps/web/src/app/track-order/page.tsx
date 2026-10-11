import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Track order' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Track order"
      features={['Lookup by order number + email (guests)', 'Status timeline and courier link']}
    />
  );
}
