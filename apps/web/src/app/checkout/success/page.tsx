import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Order placed' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Order placed"
      features={['Order confirmation summary', 'Link to order tracking']}
    />
  );
}
