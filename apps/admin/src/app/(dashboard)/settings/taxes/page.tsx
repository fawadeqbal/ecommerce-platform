import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Taxes' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Taxes"
      features={['Tax classes and rates by region', 'Inclusive / exclusive pricing']}
    />
  );
}
