import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Coupons' };

export default function Page() {
  return (
    <PagePlaceholder title="Coupons" features={['Vendor-level coupons (if enabled by admin)']} />
  );
}
