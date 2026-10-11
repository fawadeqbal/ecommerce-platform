import Link from 'next/link';

const groups = [
  {
    title: 'Shop',
    links: [
      ['All products', '/products'],
      ['Track order', '/track-order'],
      ['Sell with us', process.env.NEXT_PUBLIC_VENDOR_URL || 'http://localhost:3002'],
    ],
  },
  {
    title: 'Help',
    links: [
      ['FAQ', '/faq'],
      ['Contact', '/contact'],
      ['Shipping policy', '/pages/shipping-policy'],
      ['Return policy', '/pages/return-policy'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About', '/pages/about'],
      ['Blog', '/blog'],
      ['Terms', '/pages/terms'],
      ['Privacy', '/pages/privacy'],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="mb-3 text-sm font-semibold">{g.title}</p>
            <ul className="space-y-2 text-sm text-gray-600">
              {g.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-brand-700">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="pb-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Ecommerce
      </p>
    </footer>
  );
}
