import Link from 'next/link';
import { Suspense } from 'react';
import { SearchBox } from '@/components/search/search-box';
import { getMenu } from '@/lib/cms';
import { categoriesApi } from '@/lib/api-client';
import { getStoreSettings, storeName } from '@/lib/store-settings';
import { LocaleSwitcher } from '@/components/locale/locale-switcher';
import { container } from './container';
import { HeaderActions } from './header-actions';
import { CategoryNav, type NavItem } from './category-nav';
import { HeaderShell } from './header-shell';
import { StoreLogo } from './store-logo';

/** Used until the header menu is set up in Admin → Content → Menus. */
const fallbackNav = [
  { href: '/products', label: 'All categories' },
  { href: '/products?featured=true', label: 'Featured' },
  { href: '/products?sort=newest', label: 'New arrivals' },
  { href: '/products?sort=popular', label: 'Best sellers' },
  { href: '/products?sort=rating', label: 'Top rated' },
  { href: '/blog', label: 'Blog' },
];

/** Violet bar (sticky, shadow on scroll) + white category bar with the current link underlined. */
export async function SiteHeader() {
  const [menu, settings, tree] = await Promise.all([
    getMenu('header'),
    getStoreSettings(),
    categoriesApi.tree().catch(() => []),
  ]);
  // Live categories from the database first, then the admin's header menu (or the defaults).
  type Node = (typeof tree)[number];
  const toItem = (c: Node, depth: number): NavItem => ({
    href: `/categories/${c.slug}`,
    label: c.name,
    image: c.imageUrl,
    children: depth < 2 ? c.children.map((x) => toItem(x, depth + 1)) : [],
  });
  const categories = tree.slice(0, 10).map((c) => toItem(c, 0));
  const extras =
    menu.length > 0 ? menu.map((i) => ({ href: i.url, label: i.label })) : fallbackNav.slice(1);
  const seen = new Set<string>();
  // "All categories" opens the full browser: every top-level category with its tree.
  const all: NavItem = { ...fallbackNav[0]!, kind: 'all', children: tree.map((c) => toItem(c, 0)) };
  const nav: NavItem[] = [all, ...categories, ...extras].filter((item) => {
    const key = item.href.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return (
    <>
      {/* Utility strip: promises on the left, quick links on the right. */}
      <div className="bg-brand-800 text-[12.5px] text-white/80">
        <div className={`${container} flex h-9 items-center justify-between gap-4`}>
          <p className="flex min-w-0 items-center gap-2 truncate">
            <span aria-hidden className="h-1.5 w-1.5 flex-none rounded-full bg-accent" />
            <span className="truncate">
              <b className="font-semibold text-white">Cash on delivery</b> everywhere ·{' '}
              Easy returns · Verified sellers
            </span>
          </p>
          <nav aria-label="Quick links" className="hidden flex-none items-center gap-5 md:flex">
            <Link href="/track-order" className="transition-colors hover:text-white">
              Track order
            </Link>
            <Link href="/faq" className="transition-colors hover:text-white">
              Help center
            </Link>
            <a
              href={process.env.NEXT_PUBLIC_VENDOR_URL || '#'}
              className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white transition-colors hover:bg-accent hover:text-gray-900"
            >
              Sell with us
            </a>
          </nav>
        </div>
      </div>
      <HeaderShell>
        <div
          className={`${container} flex flex-wrap items-center gap-x-[clamp(12px,1.8vw,28px)] gap-y-3 py-3 md:flex-nowrap md:py-4`}
        >
          <StoreLogo name={storeName(settings)} logoUrl={settings?.logoUrl} />
          <Suspense
            fallback={
              <div className="order-last h-11 w-full rounded-2xl bg-white md:order-none md:w-auto md:min-w-[200px] md:flex-1" />
            }
          >
            <SearchBox />
          </Suspense>
          <div className="ml-auto flex flex-none items-center gap-1 md:ml-0">
            <LocaleSwitcher />
            <HeaderActions />
          </div>
        </div>
      </HeaderShell>
      <div className="border-b border-gray-200 bg-white shadow-[0_1px_0_rgba(27,24,48,0.02)]">
        <nav
          aria-label="Categories"
          className={`${container} scrollbar-none flex items-center gap-0.5 overflow-x-auto`}
        >
          <Suspense
            fallback={nav.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="whitespace-nowrap px-3 py-3 text-sm font-medium text-gray-600"
              >
                {item.label}
              </Link>
            ))}
          >
            <CategoryNav items={nav} />
          </Suspense>
        </nav>
      </div>
    </>
  );
}
