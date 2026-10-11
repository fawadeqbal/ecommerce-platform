import { PagePlaceholder } from '@ecommerce/ui';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <PagePlaceholder
      title={`Vendor store: ${slug}`}
      features={['Vendor banner, logo, rating, policies', 'Vendor product listing']}
    />
  );
}
