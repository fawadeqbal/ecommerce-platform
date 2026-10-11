import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Products' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Products"
      features={[
        'Product list with status (draft, pending review, published, rejected, archived)',
        'Bulk import/export (CSV)',
      ]}
    />
  );
}
