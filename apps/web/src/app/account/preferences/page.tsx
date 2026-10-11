import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Email preferences' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Email preferences"
      features={['Marketing opt-in/out', 'Account deletion request']}
    />
  );
}
