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
      {/* Utility strip (Header.dc design). */}
      <div className="border-b border-white/[.06] bg-brand-900 text-[13px] text-[#c9bfff]">
        <div className={`${container} flex h-[38px] items-center justify-between gap-4`}>
          <div className="flex min-w-0 items-center gap-[22px] overflow-hidden whitespace-nowrap">
            <span className="flex items-center gap-[7px]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-3.5 w-3.5 text-accent"><path d="M3 7h18v10H3zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /></svg>
              <span>
                <b className="font-semibold text-white">Cash on delivery</b> everywhere
              </span>
            </span>
            <span className="hidden items-center gap-[7px] sm:flex"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-3.5 w-3.5 text-accent"><path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" /></svg>Easy 7‑day returns</span>
            <span className="hidden items-center gap-[7px] xl:flex"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-3.5 w-3.5 text-accent"><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3ZM9 12l2 2 4-4" /></svg>Verified sellers</span>
          </div>
          <div className="hidden items-center gap-1.5 whitespace-nowrap md:flex">
            <Link href="/track-order" className="rounded-lg px-2.5 py-1 text-[#c9bfff] transition-colors hover:bg-white/[.08] hover:text-white">
              Track order
            </Link>
            <Link href="/faq" className="rounded-lg px-2.5 py-1 text-[#c9bfff] transition-colors hover:bg-white/[.08] hover:text-white">
              Help center
            </Link>
            <span aria-hidden className="mx-1.5 h-3.5 w-px bg-white/[.18]" />
            <a
              href={process.env.NEXT_PUBLIC_VENDOR_URL || '#'}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold text-accent transition-colors hover:bg-accent/10 hover:text-[#ffe27a]"
            >
              Sell with us <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
      <HeaderShell>
        <div
          className={`${container} flex flex-wrap items-center gap-x-[clamp(12px,2vw,28px)] gap-y-3 py-3 md:flex-nowrap md:py-[18px]`}
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
      <div className="relative z-20 bg-white shadow-[0_1px_0_#eceaf3,0_8px_20px_-14px_rgba(30,26,51,.25)]">
        <nav
          aria-label="Categories"
          className={`${container} flex h-14 items-center gap-2`}
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
