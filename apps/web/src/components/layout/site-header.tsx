import Link from 'next/link';

const nav = [
  { href: '/products', label: 'Shop' },
  { href: '/categories/all', label: 'Categories' },
  { href: '/blog', label: 'Blog' },
  { href: '/track-order', label: 'Track order' },
];

export function SiteHeader() {
  return (
    <header className="border-b border-gray-200">
      <div className="bg-brand-700 py-1.5 text-center text-xs text-white">
        Free shipping on orders over $50 {/* TODO: announcement bar from CMS */}
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
        <form action="/search" className="ml-auto hidden flex-1 md:block md:max-w-md">
          <input
            name="q"
            placeholder="Search products…"
            className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-brand-500 focus:outline-none"
          />
        </form>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/account/wishlist">Wishlist</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/login" className="font-medium text-brand-700">
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
