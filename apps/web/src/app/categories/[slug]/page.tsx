import type { Metadata } from 'next';
import { ProductListing } from '@/components/catalog/product-listing';

const titleOf = (slug: string) => slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: titleOf(slug) };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  return (
    <ProductListing searchParams={await searchParams} fixedCategory={slug} title={titleOf(slug)} />
  );
}
