import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Products' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Products"
      features={[
        'All products across vendors',
        'Approve/reject vendor products',
        'Bulk import/export (CSV)',
      ]}
    />
  );
}
