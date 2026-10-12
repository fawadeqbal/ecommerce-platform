import Link from 'next/link';
import { Suspense } from 'react';
import { SearchBox } from '@/components/search/search-box';
import { getMenu } from '@/lib/cms';
import { getStoreSettings, storeName } from '@/lib/store-settings';
import { LocaleSwitcher } from '@/components/locale/locale-switcher';
import { container } from './container';
import { HeaderActions } from './header-actions';
import { HeaderHeight } from './header-height';
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
      <header id="site-header" className="sticky top-0 z-30 bg-brand-600 text-white">
        <HeaderHeight />
        <div
          className={`${container} flex flex-wrap items-center gap-x-[clamp(12px,1.8vw,28px)] gap-y-3 py-3 md:flex-nowrap`}
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
