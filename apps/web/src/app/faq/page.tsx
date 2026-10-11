import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'FAQ' };

export default function Page() {
  return <PagePlaceholder title="FAQ" features={['FAQs grouped by category']} />;
}
