import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Returns (RMA)' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Returns (RMA)"
      features={['RMA queue: approve/reject', 'Receive items, restock', 'Refund or store credit']}
    />
  );
}
