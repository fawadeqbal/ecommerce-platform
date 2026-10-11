import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Store profile' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Store profile"
      features={['Name, logo, banner, description, policies']}
    />
  );
}
