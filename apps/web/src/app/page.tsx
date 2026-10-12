/* eslint-disable @next/next/no-img-element -- images are served from object storage */
import Link from 'next/link';
import type { BrandDto, CategoryTreeNode, StorefrontProductCard } from '@ecommerce/types';
import { cn } from '@ecommerce/ui';
import { ProductCard } from '@/components/catalog/product-card';
import { BannerStrip } from '@/components/cms/banner-strip';
import { DealsCountdown } from '@/components/home/deals-countdown';
import { HeroCarousel, type HeroSlide } from '@/components/home/hero-carousel';
import { SectionHead, productGrid } from '@/components/home/section-head';
import { container } from '@/components/layout/container';
import { getBanners } from '@/lib/cms';
import { brandsApi, categoriesApi, storefrontApi } from '@/lib/api-client';

const REVALIDATE = { next: { revalidate: 60 } };

async function products(
  params: Parameters<typeof storefrontApi.products>[0],
): Promise<StorefrontProductCard[]> {
  try {
    return (await storefrontApi.products(params, REVALIDATE)).items;
  } catch {
    return [];
  }
}

const safe = <T,>(p: Promise<T>, fallback: T) => p.catch(() => fallback);

const SLIDES: HeroSlide[] = [
  {
    tag: 'This week',
    title: 'Top brands, up to 25% off',
    sub: 'Phones, laptops and gadgets from verified sellers.',
    cta: 'Shop deals',
    href: '/products?sort=popular',
    bg: 'bg-brand-600',
  },
  {
    tag: 'Just in',
    title: 'Thousands of new styles',
    sub: 'Fresh arrivals from our stores every day. Pay on delivery.',
    cta: 'See new arrivals',
    href: '/products?sort=newest',
    bg: 'bg-gray-900',
  },
  {
    tag: 'Featured',
    title: 'Hand-picked for you',
    sub: 'Our team’s favourite products, all in one place.',
    cta: 'Shop featured',
    href: '/products?featured=true',
    bg: 'bg-[#0055a9]',
  },
];

const TRUST = [
  { k: 'C', title: 'Cash on delivery', sub: 'Pay when it arrives', tint: 'bg-tint-yellow' },
  { k: '↺', title: 'Easy returns', sub: 'Request from your orders', tint: 'bg-tint-mint' },
  { k: '✓', title: 'Verified sellers', sub: 'Every store reviewed', tint: 'bg-tint-violet' },
  { k: '%', title: 'Secure payments', sub: 'Card, wallet or cash', tint: 'bg-tint-rose' },
];

const TINTS = [
  'bg-tint-violet',
  'bg-tint-yellow',
  'bg-tint-mint',
  'bg-tint-rose',
  'bg-tint-sky',
  'bg-tint-pink',
];

/** Up to 12 distinct categories (top level first), trimmed to full rows of 6 on desktop. */
function categoryTiles(tree: CategoryTreeNode[]): CategoryTreeNode[] {
  const seen = new Set<string>();
  const out: CategoryTreeNode[] = [];
  const add = (c: CategoryTreeNode) => {
    const key = c.name.trim().toLowerCase();
    if (seen.has(c.slug) || seen.has(key) || out.length >= 12) return;
    seen.add(c.slug);
    seen.add(key);
    out.push(c);
  };
  tree.forEach(add);
  tree.forEach((c) => c.children.forEach(add)); // few top-level ones: fill with sub-categories
  return out.length > 6 && out.length < 12 ? out.slice(0, 6) : out;
}

/** Fallback picture for a category without an image: a product photo, else an icon. */
const ICONS: [RegExp, string][] = [
  [/phone|mobile/i, '📱'],
  [/laptop|computer|pc/i, '💻'],
  [/head|audio|ear|speaker/i, '🎧'],
  [/watch/i, '⌚'],
  [/camera/i, '📷'],
  [/game|console/i, '🎮'],
  [/tv|television/i, '📺'],
  [/electronic|gadget/i, '🔌'],
  [/women|dress|lawn/i, '👗'],
  [/men|shirt/i, '👔'],
  [/fashion|cloth|apparel/i, '👕'],
  [/shoe|sneaker|foot/i, '👟'],
  [/bag|luggage/i, '👜'],
  [/beauty|health|cosmetic|skin/i, '💄'],
  [/home|kitchen|furniture|living/i, '🏠'],
  [/sport|fitness|outdoor/i, '⚽'],
  [/toy|kid|baby/i, '🧸'],
  [/book|station/i, '📚'],
  [/grocery|food/i, '🛒'],
];
const iconFor = (name: string) => ICONS.find(([re]) => re.test(name))?.[1] ?? '🛍️';

async function categoryImages(cats: CategoryTreeNode[]): Promise<Record<string, string | null>> {
  const pairs = await Promise.all(
    cats.map(async (c) => {
      if (c.imageUrl) return [c.id, c.imageUrl] as const;
      const [first] = await products({ category: c.slug, sort: 'popular', limit: 1 });
      return [c.id, first?.imageUrl ?? null] as const;
    }),
  );
  return Object.fromEntries(pairs);
}

function uniqueStores(lists: StorefrontProductCard[][]) {
  const seen = new Map<string, { name: string; slug: string; count: number }>();
  for (const p of lists.flat()) {
    const s = seen.get(p.vendor.slug) ?? { ...p.vendor, count: 0 };
    s.count += 1;
    seen.set(p.vendor.slug, s);
  }
  return [...seen.values()].sort((a, b) => b.count - a.count).slice(0, 4);
}

export default async function HomePage() {
  const [hero, mid, tree, brands, featured, popular, latest] = await Promise.all([
    getBanners('home.hero'),
    getBanners('home.mid'),
    safe(categoriesApi.tree(), [] as CategoryTreeNode[]),
    safe(brandsApi.list(), [] as BrandDto[]),
    products({ featured: true, limit: 6 }),
    products({ sort: 'popular', limit: 40 }),
    products({ sort: 'newest', limit: 6 }),
  ]);
  const deals = popular
    .filter((p) => p.compareAtPrice && p.compareAtPrice > p.price && p.inStock)
    .slice(0, 6);
  const best = popular.slice(0, 5);
  const cats = categoryTiles(tree);
  const catImages = await categoryImages(cats);
  const stores = uniqueStores([featured, popular, latest]);
  const empty = featured.length + popular.length + latest.length === 0;

  return (
    <div
      className={`${container} flex flex-col gap-[clamp(30px,4vw,56px)] pt-[clamp(14px,2vw,24px)]`}
    >
      <section className="flex flex-col gap-3">
        <HeroCarousel banners={hero} slides={SLIDES} />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] gap-2.5">
          {TRUST.map((t) => (
            <div
              key={t.title}
              className="flex items-center gap-3 rounded-[18px] bg-white px-4 py-3.5"
            >
              <span
                className={cn(
                  'flex h-10 w-10 flex-none items-center justify-center rounded-xl font-extrabold',
                  t.tint,
                )}
              >
                {t.k}
              </span>
              <div>
                <p className="text-[15px] font-bold">{t.title}</p>
                <p className="text-[13px] text-gray-500">{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {cats.length > 0 ? (
        <section className="flex flex-col gap-4">
          <SectionHead title="Shop by category" href="/products" />
          <div className="scrollbar-none grid auto-cols-[42%] grid-flow-col grid-rows-2 gap-2.5 overflow-x-auto sm:auto-cols-[28%] md:grid-flow-row md:grid-cols-4 md:grid-rows-none md:overflow-visible lg:grid-cols-6">
            {cats.map((c, i) => {
              const img = catImages[c.id];
              return (
                <Link
                  key={c.id}
                  href={`/categories/${c.slug}`}
                  className={cn(
                    'group flex flex-col gap-2 rounded-[22px] p-3 pb-3.5 text-sm font-semibold transition-transform duration-200 hover:-translate-y-[3px] hover:text-gray-900',
                    TINTS[i % TINTS.length],
                  )}
                >
                  <span className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-white">
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        loading="lazy"
                        className={cn(
                          'h-full w-full transition-transform duration-300 group-hover:scale-105',
                          c.imageUrl ? 'object-cover' : 'object-contain p-3',
                        )}
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="text-5xl transition-transform duration-300 group-hover:scale-110"
                      >
                        {iconFor(c.name)}
                      </span>
                    )}
                  </span>
                  <span className="truncate">{c.name}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {deals.length > 0 ? (
        <section className="flex flex-col gap-5 rounded-4xl bg-brand-600 p-[clamp(18px,3vw,36px)] text-white">
          <SectionHead
            title="Today’s deals"
            href="/products?sort=popular"
            linkLabel="All deals →"
            tone="light"
          >
            <DealsCountdown />
          </SectionHead>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(clamp(150px,18vw,220px),1fr))] gap-3 text-gray-900">
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} dealPrice />
            ))}
          </div>
        </section>
      ) : null}

      {featured.length > 0 ? (
        <section className="flex flex-col gap-4">
          <SectionHead title="Featured for you" href="/products?featured=true" />
          <div className={productGrid}>
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} quickAdd />
            ))}
          </div>
        </section>
      ) : null}

      {mid.length > 0 ? (
        <div className="overflow-hidden rounded-4xl">
          <BannerStrip banners={mid} variant="strip" />
        </div>
      ) : (
        <section className="relative flex min-h-[clamp(220px,22vw,300px)] items-center overflow-hidden rounded-4xl bg-accent">
          <div aria-hidden className="absolute inset-y-0 right-0 hidden w-1/2 md:block">
            <span className="absolute -right-10 -top-10 h-80 w-80 rounded-full bg-white/40" />
            <span className="absolute bottom-6 right-56 h-28 w-28 rounded-3xl bg-brand-600" />
          </div>
          <div className="relative flex max-w-full flex-col gap-2.5 p-[clamp(24px,4vw,52px)] md:max-w-[52%]">
            <span className="text-sm font-bold">New every week · from all our stores</span>
            <h2 className="text-balance text-[clamp(30px,4.4vw,56px)] font-extrabold leading-[.95] tracking-display">
              Fresh arrivals, fair prices
            </h2>
            <Link
              href="/products?sort=newest"
              className="mt-1.5 self-start rounded-2xl bg-gray-900 px-6 py-3.5 font-bold text-white hover:text-white hover:opacity-90"
            >
              Shop new in
            </Link>
          </div>
        </section>
      )}

      {best.length > 0 ? (
        <section className="flex flex-col gap-4">
          <SectionHead title="Best sellers" href="/products?sort=popular" linkLabel="See all" />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(clamp(150px,17vw,240px),1fr))] gap-3">
            {best.map((p, i) => (
              <ProductCard key={p.id} product={p} rank={i + 1} />
            ))}
          </div>
        </section>
      ) : null}

      {stores.length > 0 ? (
        <section className="flex flex-col gap-4">
          <SectionHead title="Stores people love" />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,290px),1fr))] gap-3">
            {stores.map((s, i) => (
              <Link
                key={s.slug}
                href={`/stores/${s.slug}`}
                className="flex items-center gap-3.5 rounded-3xl bg-white p-4 hover:text-gray-900"
              >
                <span
                  className={cn(
                    'flex h-16 w-16 flex-none items-center justify-center rounded-full text-[26px] font-extrabold',
                    TINTS[(i + 1) % TINTS.length],
                  )}
                >
                  {s.name.charAt(0).toUpperCase()}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-base font-bold">{s.name}</span>
                  <span className="text-[13px] text-gray-500">Verified seller</span>
                </span>
                <span className="rounded-xl bg-brand-100 px-3 py-2 text-[13px] font-bold text-brand-700">
                  Visit
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {latest.length > 0 ? (
        <section className="flex flex-col gap-4">
          <SectionHead title="New arrivals" href="/products?sort=newest" />
          <div className={productGrid}>
            {latest.map((p) => (
              <ProductCard key={p.id} product={p} badge="new" />
            ))}
          </div>
        </section>
      ) : null}

      {brands.length > 0 ? (
        <section className="flex flex-col gap-3.5 rounded-3xl bg-white p-[clamp(18px,2.6vw,28px)]">
          <h2 className="text-lg font-bold">Official brand stores</h2>
          <div className="scrollbar-none flex gap-2.5 overflow-x-auto">
            {brands.slice(0, 16).map((b) => (
              <Link
                key={b.id}
                href={`/brands/${b.slug}`}
                className="flex h-14 flex-none items-center rounded-full bg-gray-50 px-6 text-[17px] font-extrabold tracking-[-0.02em] text-gray-600 hover:bg-brand-100 hover:text-brand-700"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] gap-3">
        <div className="flex flex-col gap-3.5 rounded-4xl bg-gray-900 p-[clamp(22px,3.4vw,44px)] text-white">
          <span className="self-start rounded-full bg-accent px-3 py-1.5 text-[13px] font-bold text-gray-900">
            Rewards
          </span>
          <h2 className="text-balance text-[clamp(28px,3.6vw,44px)] font-extrabold leading-none tracking-display text-white">
            Every order earns you points
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              ['Earn', 'Shop', 'on delivered orders'],
              ['Redeem', 'Save', 'at checkout'],
              ['Tiers', 'More', 'as you shop more'],
            ].map(([name, big, note]) => (
              <div key={name} className="flex flex-col gap-0.5 rounded-[18px] bg-white/[.08] p-3.5">
                <span className="text-[13px] text-gray-300">{name}</span>
                <span className="text-2xl font-extrabold text-white">{big}</span>
                <span className="text-xs text-gray-400">{note}</span>
              </div>
            ))}
          </div>
          <Link
            href="/account/loyalty"
            className="self-start rounded-2xl bg-white px-[22px] py-[13px] font-bold text-gray-900 hover:text-brand-600"
          >
            See my points
          </Link>
        </div>
        <div className="flex flex-col justify-between gap-3.5 rounded-4xl bg-brand-100 p-[clamp(22px,3.4vw,44px)]">
          <div className="flex flex-col gap-2.5">
            <span className="font-bold text-brand-700">Invite friends</span>
            <h2 className="text-[clamp(28px,3.6vw,44px)] font-extrabold leading-none tracking-display">
              You both get bonus points
            </h2>
            <p className="text-gray-600">After your friend’s first delivered order.</p>
          </div>
          <Link
            href="/account/loyalty"
            className="self-start rounded-2xl bg-brand-600 px-[22px] py-[13px] font-bold text-white hover:bg-brand-700 hover:text-white"
          >
            Share my link
          </Link>
        </div>
      </section>

      {empty ? (
        <p className="text-center text-gray-500">
          No products yet. Approve products in the admin to see them here.
        </p>
      ) : null}
    </div>
  );
}
