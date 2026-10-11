import { PagePlaceholder } from '@ecommerce/ui';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PagePlaceholder
      title={`Order: ${id}`}
      features={[
        'Order and vendor sub-orders',
        'Status changes, internal & customer notes',
        'Full/partial refunds, payment reconciliation',
        'Packing slips, invoices, shipping labels',
      ]}
    />
  );
}
