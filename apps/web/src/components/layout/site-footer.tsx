import Link from 'next/link';
import { NewsletterSignup } from '@/components/marketing/newsletter-signup';
import { getMenu } from '@/lib/cms';
import { getStoreSettings, storeName } from '@/lib/store-settings';
import { container } from './container';
import { StoreLogo } from './store-logo';

/** Used until the footer menu is set up in Admin → Content → Menus. */
const fallbackGroups = [
  {
    title: 'Shop',
    links: [
      ['All products', '/products'],
      ['Track order', '/track-order'],
      ['Sell with us', process.env.NEXT_PUBLIC_VENDOR_URL || 'http://localhost:3002'],
      ['Gift cards', '/account/loyalty'],
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
  const [menu, settings] = await Promise.all([getMenu('footer'), getStoreSettings()]);
  const name = storeName(settings);
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
    <footer className="mt-[clamp(40px,5vw,72px)] bg-white">
      <div className={`${container} pt-[clamp(28px,4vw,48px)]`}>
        <NewsletterSignup />
      </div>
      <div
        className={`${container} grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-7 py-[clamp(28px,4vw,48px)]`}
      >
        <div className="flex flex-col gap-2.5">
          <StoreLogo name={name} tone="dark" href={null} />
          <p className="max-w-[240px] text-sm text-gray-500">
            Thousands of products from trusted sellers, with cash on delivery.
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title} className="flex flex-col gap-[9px]">
            <p className="text-[15px] font-bold">{g.title}</p>
            {g.links.map(([label, href]) => (
              <Link key={label} href={href} className="text-sm text-gray-500 hover:text-brand-600">
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <p className="border-t border-gray-200 p-4 text-center text-[13px] text-gray-500">
        © {new Date().getFullYear()} {name}
      </p>
    </footer>
  );
}
