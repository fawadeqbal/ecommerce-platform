import Link from 'next/link';
import { Suspense } from 'react';
import { SearchBox } from '@/components/search/search-box';
import { getMenu } from '@/lib/cms';
import { LocaleSwitcher } from '@/components/locale/locale-switcher';
import { HeaderActions } from './header-actions';

/** Used until the header menu is set up in Admin → Content → Menus. */
const fallbackNav = [
  { href: '/products', label: 'Shop' },
  { href: '/categories/electronics', label: 'Electronics' },
  { href: '/categories/fashion', label: 'Fashion' },
  { href: '/products?featured=true', label: 'Featured' },
];

export async function SiteHeader() {
  const menu = await getMenu('header');
  const nav = menu.length > 0 ? menu.map((i) => ({ href: i.url, label: i.label })) : fallbackNav;
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="bg-brand-700 py-1.5 text-center text-xs text-white">
        Shop from trusted sellers · Cash on delivery available{' '}
        {/* TODO: announcement bar from CMS */}
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link href="/" className="text-xl font-bold text-brand-700">
          Ecommerce
        </Link>
        <nav className="hidden gap-5 text-sm text-gray-700 md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-brand-700">
              {item.label}
            </Link>
          ))}
        </nav>
        <Suspense fallback={<div className="ml-auto hidden flex-1 md:block md:max-w-md" />}>
          <SearchBox />
        </Suspense>
        <LocaleSwitcher />
        <HeaderActions />
      </div>
    </header>
  );
}
