import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Wishlist' };

export default function Page() {
  return <PagePlaceholder title="Wishlist" features={['Saved products, move to cart']} />;
}
