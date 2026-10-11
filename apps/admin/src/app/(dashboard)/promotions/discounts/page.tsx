import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Automatic discounts' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Automatic discounts"
      features={['Flash sales', 'Buy X get Y', 'Tiered discounts']}
    />
  );
}
