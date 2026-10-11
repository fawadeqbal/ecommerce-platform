import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Menus' };

export default function Page() {
  return <PagePlaceholder title="Menus" features={['Header and footer menus']} />;
}
