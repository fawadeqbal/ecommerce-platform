import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Localization' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Localization"
      features={['Currencies and exchange rates', 'Languages']}
    />
  );
}
