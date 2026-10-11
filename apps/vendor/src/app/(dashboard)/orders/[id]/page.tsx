import { PagePlaceholder } from '@ecommerce/ui';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PagePlaceholder
      title={`Order: ${id}`}
      features={[
        'Update status: confirmed, packed, shipped (tracking), delivered',
        'Packing slip and invoice',
        'Cancellations',
      ]}
    />
  );
}
