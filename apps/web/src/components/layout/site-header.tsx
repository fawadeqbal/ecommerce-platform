import Link from 'next/link';
import { Suspense } from 'react';
import { SearchBox } from '@/components/search/search-box';
import { getMenu } from '@/lib/cms';
import { getStoreSettings, storeName } from '@/lib/store-settings';
import { LocaleSwitcher } from '@/components/locale/locale-switcher';
import { container } from './container';
import { HeaderActions } from './header-actions';
import { CategoryNav } from './category-nav';
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
  const [menu, settings] = await Promise.all([getMenu('header'), getStoreSettings()]);
  const nav = menu.length > 0 ? menu.map((i) => ({ href: i.url, label: i.label })) : fallbackNav;
  return (
    <>
      <HeaderShell>
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
      </HeaderShell>
      <div className="border-b border-gray-200 bg-white">
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
          <span className="ml-auto hidden items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-100 px-3 py-1.5 text-[13px] font-semibold text-brand-700 sm:flex">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Cash on delivery everywhere
          </span>
        </nav>
      </div>
    </>
  );
}
