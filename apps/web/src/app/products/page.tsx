import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'All products' };

export default function Page() {
  return (
    <PagePlaceholder
      title="All products"
      features={[
        'Product grid with pagination / infinite scroll',
        'Filters: price, brand, vendor, rating, availability, dynamic attributes',
        'Sorting: relevance, price, newest, popularity, rating',
      ]}
    />
  );
}
