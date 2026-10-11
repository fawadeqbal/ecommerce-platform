import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Admin users' };

export default function Page() {
  return <PagePlaceholder title="Admin users" features={['Staff accounts and role assignment']} />;
}
