import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Add product' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Add product"
      features={['Variants, attributes, images, SEO fields', 'Submit for review']}
    />
  );
}
