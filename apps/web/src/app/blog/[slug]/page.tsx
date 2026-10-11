import { PagePlaceholder } from '@ecommerce/ui';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <PagePlaceholder
      title={`Blog post: ${slug}`}
      features={['Article with cover image, author, related posts']}
    />
  );
}
