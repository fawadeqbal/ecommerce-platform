/* eslint-disable @next/next/no-img-element -- images are served from object storage */
import Link from 'next/link';
import type { BrandDto, CategoryTreeNode, StorefrontProductCard } from '@ecommerce/types';
import { cn } from '@ecommerce/ui';
import { ProductCard } from '@/components/catalog/product-card';
import { BannerStrip } from '@/components/cms/banner-strip';
import { BrandMarquee } from '@/components/home/brand-marquee';
import { ProductTabs } from '@/components/home/product-tabs';
import { Reveal } from '@/components/home/reveal';
import { DealsCountdown } from '@/components/home/deals-countdown';
import { HeroCarousel, type HeroSlide } from '@/components/home/hero-carousel';
import { SectionHead } from '@/components/home/section-head';
import { container } from '@/components/layout/container';
import { getBanners } from '@/lib/cms';
import { brandsApi, categoriesApi, storefrontApi } from '@/lib/api-client';

// Live data: new arrivals and deals change as sellers publish and discount products.
export const dynamic = 'force-dynamic';
const REVALIDATE = { cache: 'no-store' as const };

async function products(
  params: Parameters<typeof storefrontApi.products>[0],
  options: Parameters<typeof storefrontApi.products>[1] = REVALIDATE,
): Promise<StorefrontProductCard[]> {
  try {
    return (await storefrontApi.products(params, options)).items;
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
    href: '/products?onSale=true',
    bg: 'bg-gradient-to-br from-brand-600 to-brand-800',
  },
  {
    tag: 'Just in',
    title: 'Thousands of new styles',
    sub: 'Fresh arrivals from our stores every day. Pay on delivery.',
    cta: 'See new arrivals',
    href: '/products?sort=newest',
    bg: 'bg-gradient-to-br from-gray-900 to-[#2a2450]',
  },
  {
    tag: 'Featured',
    title: 'Hand-picked for you',
    sub: 'Our team’s favourite products, all in one place.',
    cta: 'Shop featured',
    href: '/products?featured=true',
    bg: 'bg-gradient-to-br from-[#0055a9] to-[#0a2f66]',
  },
];

const TRUST = [
  {
    title: 'Cash on delivery',
    sub: 'Pay when it arrives',
    tint: 'bg-tint-yellow text-amber-800',
    icon: 'M3 7h18v10H3zM7 12h.01M17 12h.01M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  },
  {
    title: 'Easy returns',
    sub: 'Request from your orders',
    tint: 'bg-tint-mint text-emerald-800',
    icon: 'M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4',
  },
  {
    title: 'Verified sellers',
    sub: 'Every store reviewed',
    tint: 'bg-tint-violet text-brand-800',
    icon: 'M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3ZM9 12l2 2 4-4',
  },
  {
    title: 'Secure payments',
    sub: 'Card, wallet or cash',
    tint: 'bg-tint-rose text-rose-800',
    icon: 'M6 11V8a6 6 0 0 1 12 0v3M5 11h14v10H5zM12 15v2',
  },
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
    if (seen.has(c.slug) || seen.has(key) || out.length >= 24) return;
    seen.add(c.slug);
    seen.add(key);
    out.push(c);
  };
  tree.forEach(add);
  tree.forEach((c) => c.children.forEach(add)); // few top-level ones: fill with sub-categories
  return out;
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
      // Fallback photo only: cached for 10 minutes so the live home page stays light.
      const [first] = await products(
        { category: c.slug, sort: 'popular', limit: 1 },
        { next: { revalidate: 600 } },
      );
      return [c.id, first?.imageUrl ?? null] as const;
    }),
  );
  return Object.fromEntries(pairs);
}

export default async function HomePage() {
  const [hero, mid, tree, brands, featured, popular, latest, onSale] = await Promise.all([
    getBanners('home.hero'),
    getBanners('home.mid'),
    safe(categoriesApi.tree(), [] as CategoryTreeNode[]),
    safe(brandsApi.list(), [] as BrandDto[]),
    products({ featured: true, limit: 10 }),
    products({ sort: 'popular', limit: 40 }),
    products({ sort: 'newest', limit: 10 }),
    products({ onSale: true, inStock: true, sort: 'newest', limit: 6 }),
  ]);
  const deals = onSale.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);
  const best = popular.slice(0, 10);
  const cats = categoryTiles(tree);
  const catImages = await categoryImages(cats);
  const empty = featured.length + popular.length + latest.length === 0;

  return (
    <div
      className={`${container} flex flex-col gap-[clamp(44px,5.2vw,76px)] pb-6 pt-[clamp(14px,2vw,24px)]`}
    >
      <section className="flex flex-col gap-3">
        <HeroCarousel
          banners={hero}
          slides={SLIDES.map((slide, i) => ({
            ...slide,
            // Live products on each slide: deals, new arrivals, featured.
            products: [deals.length ? deals : popular, latest, featured.length ? featured : popular][i] ?? [],
          }))}
        />
        <div className="scrollbar-none -mx-4 flex snap-x scroll-px-4 gap-2.5 overflow-x-auto px-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
          {TRUST.map((t) => (
            <div
              key={t.title}
              className="flex w-[64%] flex-none snap-start items-center gap-2.5 rounded-[18px] bg-white px-3.5 py-3 ring-1 ring-black/[.04] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card sm:w-[40%] md:w-auto"
            >
              <span
                className={cn(
                  'flex h-8 w-8 flex-none items-center justify-center rounded-lg',
                  t.tint,
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  className="h-4 w-4"
                >
                  <path d={t.icon} />
                </svg>
              </span>
              <div>
                <p className="text-sm font-bold">{t.title}</p>
                <p className="text-xs text-gray-500">{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {cats.length > 0 ? (
        <Reveal>
        <section className="relative overflow-hidden rounded-4xl bg-white p-[clamp(16px,2.6vw,32px)] shadow-card">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-brand-200/50 blur-3xl"
          />
          <div className="relative mb-4 flex items-end justify-between gap-3 sm:mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
                Explore
              </p>
              <h2 className="text-[clamp(22px,2.6vw,32px)] font-extrabold leading-tight tracking-heading">
                Shop by category
              </h2>
            </div>
            <Link
              href="/products"
              className="flex-none rounded-full bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
            >
              View all
            </Link>
          </div>
          {/* Phone: one swipeable row with every category. Desktop: a full grid. */}
          <div className="scrollbar-none relative -mx-[clamp(16px,2.6vw,32px)] flex snap-x snap-mandatory scroll-px-[clamp(16px,2.6vw,32px)] gap-3 overflow-x-auto px-[clamp(16px,2.6vw,32px)] pb-1 md:mx-0 md:grid md:snap-none md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:gap-4 md:overflow-visible md:px-0">
            {cats.map((c, i) => {
              const img = catImages[c.id];
              return (
                <Link
                  key={c.id}
                  href={`/categories/${c.slug}`}
                  className="group flex w-[92px] flex-none snap-start flex-col items-center gap-2 text-center sm:w-[110px] md:w-auto"
                >
                  <span
                    className={cn(
                      'relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[26px] ring-1 ring-black/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-card group-hover:ring-2 group-hover:ring-brand-500',
                      TINTS[i % TINTS.length],
                    )}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        loading="lazy"
                        className={cn(
                          'h-full w-full transition-transform duration-500 group-hover:scale-110',
                          c.imageUrl ? 'object-cover' : 'object-contain p-3 mix-blend-multiply',
                        )}
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="text-[40px] transition-transform duration-300 group-hover:scale-110 md:text-5xl"
                      >
                        {iconFor(c.name)}
                      </span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 hidden translate-y-full bg-gradient-to-t from-brand-700/90 to-transparent pb-2 pt-6 text-xs font-bold text-white transition-transform duration-300 group-hover:translate-y-0 md:block">
                      Shop now →
                    </span>
                  </span>
                  <span className="line-clamp-2 text-[13px] font-semibold leading-tight text-gray-800 group-hover:text-brand-700 md:text-sm">
                    {c.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
        </Reveal>
      ) : null}

      {deals.length > 0 ? (
        <Reveal>
        <section className="relative grid gap-5 overflow-hidden rounded-4xl bg-[linear-gradient(160deg,#6447e6,#4a2fc4)] p-[clamp(18px,3vw,32px)] text-white md:grid-cols-[minmax(240px,300px)_minmax(0,1fr)] md:gap-6">
          <span aria-hidden className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <span aria-hidden className="pointer-events-none absolute -bottom-16 left-40 h-40 w-40 rounded-full bg-accent/25 blur-2xl" />

          {/* Left: the offer */}
          <div className="relative flex flex-col justify-between gap-5">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Limited time</p>
              <h2 className="text-[clamp(30px,3.6vw,46px)] font-extrabold leading-none tracking-display">
                Today’s deals
              </h2>
              <p className="max-w-[260px] text-[15px] text-white/75">
                Hand-picked price drops. New deals every day at midnight.
              </p>
              <div className="self-start">
                <DealsCountdown />
              </div>
            </div>
            <Link
              href="/products?onSale=true"
              className="group/link inline-flex items-center gap-2 self-start rounded-2xl bg-white px-5 py-3 font-bold text-gray-900 shadow-lg shadow-black/10 transition-colors hover:bg-accent hover:text-gray-900"
            >
              See all deals
              <span aria-hidden className="transition-transform group-hover/link:translate-x-1">→</span>
            </Link>
          </div>

          {/* Right: the products, in a swipeable row */}
          <div className="scrollbar-none relative -mx-[clamp(18px,3vw,32px)] flex snap-x scroll-px-[clamp(18px,3vw,32px)] gap-3 overflow-x-auto px-[clamp(18px,3vw,32px)] pb-1 text-gray-900 md:mx-0 md:px-0">
            {deals.map((p) => (
              <div key={p.id} className="w-[46%] flex-none snap-start sm:w-[220px]">
                <ProductCard product={p} dealPrice />
              </div>
            ))}
            <Link
              href="/products?onSale=true"
              className="flex w-[46%] flex-none snap-start flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/30 p-6 text-center font-bold text-white transition-colors hover:border-white/60 hover:bg-white/5 hover:text-white sm:w-[220px]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white/15 text-xl">→</span>
              More deals
            </Link>
          </div>
        </section>
        </Reveal>
      ) : null}

      {featured.length + best.length + latest.length > 0 ? (
        <Reveal>
          <ProductTabs
            tabs={[
              { key: 'featured', label: 'Featured', href: '/products?featured=true', products: featured },
              { key: 'best', label: 'Best sellers', href: '/products?sort=popular', products: best, ranked: true },
              { key: 'new', label: 'New arrivals', href: '/products?sort=newest', products: latest, badge: 'new' },
            ]}
          />
        </Reveal>
      ) : null}

      {mid.length > 0 ? (
        <Reveal>
          <BannerStrip banners={mid} variant="strip" />
        </Reveal>
      ) : null}

      {brands.length > 0 ? (
        <Reveal>
        <section className="flex flex-col gap-5">
          <SectionHead eyebrow="Shop the brands" title="Official brand stores" />
          <div className="-mx-4 sm:-mx-6 md:mx-0">
            <BrandMarquee brands={brands.slice(0, 24)} />
          </div>
        </section>
        </Reveal>
      ) : null}

      <Reveal>
      <section className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] gap-3">
        <div className="flex flex-col gap-3.5 rounded-4xl bg-white p-[clamp(22px,3.4vw,44px)] ring-1 ring-black/[.04]">
          <span className="self-start rounded-full bg-accent px-3 py-1.5 text-[13px] font-bold text-gray-900">
            Rewards
          </span>
          <h2 className="text-balance text-[clamp(28px,3.6vw,44px)] font-extrabold leading-none tracking-display text-gray-900">
            Every order earns you points
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              ['Earn', 'Shop', 'on delivered orders'],
              ['Redeem', 'Save', 'at checkout'],
              ['Tiers', 'More', 'as you shop more'],
            ].map(([name, big, note]) => (
              <div key={name} className="flex flex-col gap-0.5 rounded-[18px] bg-gray-50 p-3.5">
                <span className="text-[13px] text-gray-500">{name}</span>
                <span className="text-2xl font-extrabold text-brand-700">{big}</span>
                <span className="text-xs text-gray-500">{note}</span>
              </div>
            ))}
          </div>
          <Link
            href="/account/loyalty"
            className="self-start rounded-2xl bg-gray-900 px-[22px] py-[13px] font-bold text-white hover:bg-brand-700 hover:text-white"
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
      </Reveal>

      {empty ? (
        <p className="text-center text-gray-500">
          No products yet. Approve products in the admin to see them here.
        </p>
      ) : null}
    </div>
  );
}
