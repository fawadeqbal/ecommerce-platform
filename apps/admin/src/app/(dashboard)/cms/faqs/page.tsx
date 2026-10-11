import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'FAQs' };

export default function Page() {
  return <PagePlaceholder title="FAQs" features={['FAQ management']} />;
}
