'use client';

import Link from 'next/link';
import { useCart, useMe } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useLocale } from '@/components/locale/locale-provider';
import { CartIcon, HeartIcon, TruckIcon, UserIcon } from '@/components/icons';
import { AccountMenu } from './account-menu';

const link =
  'flex items-center gap-1.5 whitespace-nowrap rounded-[14px] px-2.5 py-[9px] text-white hover:bg-white/10 hover:text-white';

export function HeaderActions() {
  const { data: cart } = useCart();
  const { t } = useLocale();
  const { data: me } = useMe();
  const count = cart?.itemCount ?? 0;
  const saved = useWishlist().data?.items.length ?? 0;

  return (
    <div className="flex items-center gap-1 text-sm font-semibold">
      <Link
        href="/track-order"
        title={t('header.trackOrder')}
        aria-label={t('header.trackOrder')}
        className={`${link} hidden lg:flex`}
      >
        <TruckIcon />
        <span className="hidden xl:inline">{t('header.trackOrder')}</span>
      </Link>
      <Link
        href={me ? '/account/wishlist' : '/login?next=/account/wishlist'}
        title={t('header.wishlist')}
        aria-label={`${t('header.wishlist')}${saved > 0 ? ` (${saved})` : ''}`}
        className={`${link} relative hidden sm:flex`}
      >
        <HeartIcon />
        <span className="hidden xl:inline">{t('header.wishlist')}</span>
        {saved > 0 ? (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-extrabold text-gray-900 xl:static xl:h-5 xl:min-w-5 xl:text-[11px]">
            {saved}
          </span>
        ) : null}
      </Link>
      {me ? (
        <AccountMenu
          firstName={me.firstName}
          lastName={me.lastName}
          email={me.email}
          greeting={t('header.hi', { name: me.firstName })}
        />
      ) : (
        <Link href="/login" className={link}>
          <UserIcon />
          <span className="hidden sm:inline">{t('header.signIn')}</span>
        </Link>
      )}
      <Link
        href="/cart"
        aria-label={`${t('header.cart')} (${count})`}
        className="ml-1 flex items-center gap-2 rounded-[14px] bg-white px-3 py-[9px] text-gray-900 shadow-[0_6px_16px_-8px_rgba(27,15,73,.6)] hover:-translate-y-px hover:text-brand-600"
      >
        <CartIcon />
        <span className="hidden sm:inline">{t('header.cart')}</span>
        <span
          key={count}
          className="inline-flex h-5 min-w-5 animate-bump items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-bold text-white"
        >
          {count}
        </span>
      </Link>
    </div>
  );
}
