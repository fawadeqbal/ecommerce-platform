import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Staff' };

export default function Page() {
  return <PagePlaceholder title="Staff" features={['Vendor staff accounts with permissions']} />;
}
