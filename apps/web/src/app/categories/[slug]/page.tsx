import type { Metadata } from 'next';
import { ProductListing } from '@/components/catalog/product-listing';
import { BannerStrip } from '@/components/cms/banner-strip';
import { getBanners } from '@/lib/cms';

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
  const banners = await getBanners('category.top');
  return (
    <>
      {banners.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4 pt-6">
          <BannerStrip banners={banners} variant="strip" />
        </div>
      ) : null}
      <ProductListing
        searchParams={await searchParams}
        fixedCategory={slug}
        title={titleOf(slug)}
      />
    </>
  );
}
