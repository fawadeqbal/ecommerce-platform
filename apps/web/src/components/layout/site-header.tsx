import Link from 'next/link';
import { HeaderActions } from './header-actions';

const nav = [
  { href: '/products', label: 'Shop' },
  { href: '/categories/electronics', label: 'Electronics' },
  { href: '/categories/fashion', label: 'Fashion' },
  { href: '/products?featured=true', label: 'Featured' },
];

export function SiteHeader() {
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
        <form action="/products" className="ml-auto hidden flex-1 md:block md:max-w-md">
          <input
            name="q"
            placeholder="Search products…"
            aria-label="Search products"
            className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-brand-500 focus:outline-none"
          />
        </form>
        <HeaderActions />
      </div>
    </header>
  );
}
