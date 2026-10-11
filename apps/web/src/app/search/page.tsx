import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Search' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Search"
      features={['Results with typo tolerance', 'Autocomplete suggestions', 'Filters and sorting']}
    />
  );
}
