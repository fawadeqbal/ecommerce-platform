'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@ecommerce/ui';
import { useCart, useMe } from '@/hooks/use-cart';
import { useLocale } from '@/components/locale/locale-provider';

/** Bottom tab bar on phones (hidden from md up). */
export function MobileTabBar() {
  const pathname = usePathname();
  const { t } = useLocale();
  const { data: me } = useMe();
  const count = useCart().data?.itemCount ?? 0;
  const tabs = [
    { href: '/', label: t('header.home'), active: pathname === '/' },
    {
      href: '/products',
      label: t('header.categories'),
      active: pathname.startsWith('/products') || pathname.startsWith('/categories'),
    },
    { href: '/products?sort=popular', label: t('header.deals'), active: false },
    {
      href: '/cart',
      label: count > 0 ? `${t('header.cart')} (${count})` : t('header.cart'),
      active: pathname.startsWith('/cart'),
    },
    {
      href: me ? '/account/orders' : '/login',
      label: t('header.account'),
      active: pathname.startsWith('/account') || pathname.startsWith('/login'),
    },
  ];
  return (
    <nav
      aria-label="Shortcuts"
      className="sticky bottom-0 z-30 grid grid-cols-5 border-t border-gray-200 bg-white px-1 pb-2.5 pt-1.5 md:hidden"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            'flex flex-col items-center gap-1 py-1.5 text-[11px] font-semibold',
            tab.active ? 'text-brand-600' : 'text-gray-500',
          )}
        >
          {tab.label}
          <span
            aria-hidden
            className={cn(
              'h-[5px] w-[5px] rounded-full',
              tab.active ? 'bg-brand-600' : 'bg-transparent',
            )}
          />
        </Link>
      ))}
    </nav>
  );
}
