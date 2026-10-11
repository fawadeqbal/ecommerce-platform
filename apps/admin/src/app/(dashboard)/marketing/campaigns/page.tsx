import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Email campaigns' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Email campaigns"
      features={[
        'Campaigns to segments with scheduling',
        'Abandoned cart sequences',
        'Win-back and review requests',
      ]}
    />
  );
}
