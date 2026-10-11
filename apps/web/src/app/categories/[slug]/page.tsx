import { PagePlaceholder } from '@ecommerce/ui';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <PagePlaceholder
      title={`Category: ${slug}`}
      features={['Category listing with subcategories, filters and sorting', 'Category SEO meta']}
    />
  );
}
