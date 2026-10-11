import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Roles & permissions' };

export default function Page() {
  return (
    <PagePlaceholder title="Roles & permissions" features={['Roles and granular permissions']} />
  );
}
