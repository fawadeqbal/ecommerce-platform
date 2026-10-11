import { PagePlaceholder } from '@ecommerce/ui';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <PagePlaceholder
      title={`Product: ${slug}`}
      features={[
        'Image gallery with zoom; video',
        'Variant selector with per-variant price/stock/images',
        'Price, compare-at price, discount badge, stock status',
        'Description, specs, shipping & returns',
        'Seller info → vendor store',
        'Reviews (with photos) and Q&A',
        'Related, frequently bought together, recently viewed',
        'Add to cart, buy now, wishlist, share',
        'Back-in-stock email alert',
        'Product + Breadcrumb structured data',
      ]}
    />
  );
}
