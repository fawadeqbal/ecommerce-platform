import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Reviews & Q&A' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Reviews & Q&A"
      features={['Review moderation', 'Product Q&A moderation']}
    />
  );
}
