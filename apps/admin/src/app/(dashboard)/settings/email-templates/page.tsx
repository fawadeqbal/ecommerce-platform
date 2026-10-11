import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Email templates' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Email templates"
      features={['Edit subjects and content blocks', 'Enable/disable', 'Email logs']}
    />
  );
}
