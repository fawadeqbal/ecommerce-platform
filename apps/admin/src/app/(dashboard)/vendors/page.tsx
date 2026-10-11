import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Vendors' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Vendors"
      features={['Applications: approve/reject', 'Suspend vendors', 'Vendor details and documents']}
    />
  );
}
