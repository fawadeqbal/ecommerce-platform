import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Commissions' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Commissions"
      features={['Global, per-category and per-vendor commission rules']}
    />
  );
}
