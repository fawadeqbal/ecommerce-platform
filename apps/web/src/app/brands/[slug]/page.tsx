import { PagePlaceholder } from '@ecommerce/ui';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <PagePlaceholder title={`Brand: ${slug}`} features={['Brand header and product listing']} />
  );
}
