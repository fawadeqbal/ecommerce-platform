import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Attributes' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Attributes"
      features={['Attributes and values (color, size…)', 'Filterable flags']}
    />
  );
}
