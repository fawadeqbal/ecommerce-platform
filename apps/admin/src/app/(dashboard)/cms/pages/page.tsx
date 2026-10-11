import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Pages' };

export default function Page() {
  return <PagePlaceholder title="Pages" features={['Block-editor pages per locale']} />;
}
