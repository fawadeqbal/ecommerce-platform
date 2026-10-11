import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'SEO' };

export default function Page() {
  return (
    <PagePlaceholder
      title="SEO"
      features={['Meta defaults', '301 redirect manager', 'Sitemap status']}
    />
  );
}
