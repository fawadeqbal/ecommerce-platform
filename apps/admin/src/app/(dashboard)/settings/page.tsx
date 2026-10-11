import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Store settings' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Store settings"
      features={['Name, logo, contact, policies', 'Maintenance mode']}
    />
  );
}
