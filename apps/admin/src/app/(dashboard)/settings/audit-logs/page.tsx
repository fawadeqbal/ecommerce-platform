import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Audit logs' };

export default function Page() {
  return <PagePlaceholder title="Audit logs" features={['Admin and vendor action history']} />;
}
