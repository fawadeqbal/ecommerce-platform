import { PagePlaceholder } from '@ecommerce/ui';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PagePlaceholder
      title={`Customer: ${id}`}
      features={['Profile, addresses, order history', 'Manual loyalty point adjustments']}
    />
  );
}
