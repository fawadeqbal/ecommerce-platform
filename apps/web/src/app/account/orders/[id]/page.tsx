import { PagePlaceholder } from '@ecommerce/ui';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PagePlaceholder
      title={`Order: ${id}`}
      features={[
        'Status timeline and tracking',
        'Cancel (before shipment)',
        'Download invoice PDF',
        'Request return / exchange',
        'Refund status',
        'Write reviews',
        'Reorder',
      ]}
    />
  );
}
