import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Blog' };

export default function Page() {
  return <PagePlaceholder title="Blog" features={['Posts, categories, tags, authors']} />;
}
