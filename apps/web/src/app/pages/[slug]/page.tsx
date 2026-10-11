import { PagePlaceholder } from '@ecommerce/ui';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <PagePlaceholder
      title={`Page: ${slug}`}
      features={['CMS block-rendered page (About, Terms, Privacy, policies)']}
    />
  );
}
