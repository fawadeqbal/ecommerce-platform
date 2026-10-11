import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Home' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Home"
      features={[
        'Hero banners / sliders (CMS placement home.hero)',
        'Featured categories',
        'Featured, new and best-selling products',
        'Flash sale section with countdown',
        'Vendor highlights',
      ]}
    />
  );
}
