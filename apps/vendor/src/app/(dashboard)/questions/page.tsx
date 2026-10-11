import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Questions' };

export default function Page() {
  return <PagePlaceholder title="Questions" features={['Answer product questions']} />;
}
