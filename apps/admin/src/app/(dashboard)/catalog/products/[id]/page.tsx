import { PagePlaceholder } from '@ecommerce/ui';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PagePlaceholder
      title={`Edit product: ${id}`}
      features={['Variants, attributes, images, SEO fields, translations']}
    />
  );
}
