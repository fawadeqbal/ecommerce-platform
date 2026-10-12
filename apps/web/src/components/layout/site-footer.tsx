import Link from 'next/link';
import { NewsletterSignup } from '@/components/marketing/newsletter-signup';
import { getMenu } from '@/lib/cms';

/** Used until the footer menu is set up in Admin → Content → Menus. */
const fallbackGroups = [
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

export async function SiteFooter() {
  const menu = await getMenu('footer');
  const groups: { title: string; links: (readonly [string, string])[] }[] =
    menu.length > 0
      ? menu.map((col) => ({
          title: col.label,
          links: (col.children.length > 0
            ? col.children
            : [{ label: col.label, url: col.url }]
          ).map((l): readonly [string, string] => [l.label, l.url]),
        }))
      : fallbackGroups.map((g) => ({ title: g.title, links: [...g.links] }));
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <NewsletterSignup />
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
