import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Become a seller' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Become a seller"
      features={['Business details and documents', 'Pending admin approval email']}
    />
  );
}
