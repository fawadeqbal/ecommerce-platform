import Link from 'next/link';
import { Suspense } from 'react';
import { SearchBox } from '@/components/search/search-box';
import { getMenu } from '@/lib/cms';
import { getStoreSettings, storeName } from '@/lib/store-settings';
import { LocaleSwitcher } from '@/components/locale/locale-switcher';
import { container } from './container';
import { HeaderActions } from './header-actions';
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

/** Violet bar (sticky) + white category bar. Rendered straight into <body> so the bar can stick. */
export async function SiteHeader() {
  const [menu, settings] = await Promise.all([getMenu('header'), getStoreSettings()]);
  const nav = menu.length > 0 ? menu.map((i) => ({ href: i.url, label: i.label })) : fallbackNav;
  return (
    <>
      <header className="sticky top-0 z-30 bg-brand-600 text-white">
        <div
          className={`${container} flex flex-wrap items-center gap-x-[clamp(14px,2.4vw,36px)] gap-y-3 py-3.5`}
        >
          <StoreLogo name={storeName(settings)} logoUrl={settings?.logoUrl} />
          <Link
            href="/products"
            className="hidden items-center gap-1.5 rounded-[14px] bg-white/[.14] px-3.5 py-[9px] text-sm font-semibold text-white hover:bg-white/20 hover:text-white md:flex"
          >
            Categories <span aria-hidden>▾</span>
          </Link>
          <Suspense
            fallback={<div className="order-3 h-12 flex-[1_1_400px] rounded-2xl bg-white" />}
          >
            <SearchBox />
          </Suspense>
          <div className="order-2 ml-auto flex items-center gap-1.5">
            <LocaleSwitcher />
            <HeaderActions />
          </div>
        </div>
      </header>
      <div className="border-b border-gray-200 bg-white">
        <nav
          aria-label="Categories"
          className={`${container} scrollbar-none flex items-center gap-1.5 overflow-x-auto`}
        >
          {nav.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="whitespace-nowrap p-3 text-sm font-medium text-gray-600 hover:text-brand-600"
            >
              {item.label}
            </Link>
          ))}
          <span className="ml-auto hidden whitespace-nowrap rounded-full bg-brand-100 px-3 py-1.5 text-[13px] font-semibold text-brand-700 sm:inline">
            Cash on delivery everywhere
          </span>
        </nav>
      </div>
    </>
  );
}
