'use client';

import Link from 'next/link';
import { useCart, useMe } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useLocale } from '@/components/locale/locale-provider';
import { CartIcon, TruckIcon, UserIcon } from '@/components/icons';
import { Tooltip } from '@ecommerce/ui';
import { headerChip } from './header-chip';
import { AccountMenu } from './account-menu';

export function HeaderActions() {
  const { data: cart } = useCart();
  const { t } = useLocale();
  const { data: me } = useMe();
  const count = cart?.itemCount ?? 0;
  const saved = useWishlist().data?.items.length ?? 0;

  return (
    <div className="flex items-center gap-2">
      <span className="hidden lg:inline-flex">
        <Tooltip content={t('header.trackOrder')}>
          <Link
            href="/track-order"
            aria-label={t('header.trackOrder')}
            className={`${headerChip} w-10`}
          >
            <TruckIcon />
          </Link>
        </Tooltip>
      </span>
      {me ? (
        <AccountMenu
          firstName={me.firstName}
          lastName={me.lastName}
          email={me.email}
          greeting={t('header.hi', { name: me.firstName })}
          wishlistCount={saved}
        />
      ) : (
        <Link href="/login" className={`${headerChip} px-3`}>
          <UserIcon size={18} />
          <span className="hidden sm:inline">{t('header.signIn')}</span>
        </Link>
      )}
      <Tooltip content={t('header.cart')}>
        <Link
          href="/cart"
          aria-label={`${t('header.cart')} (${count})`}
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-900 shadow-[0_6px_16px_-8px_rgba(27,15,73,.6)] hover:-translate-y-px hover:text-brand-600"
        >
          <CartIcon />
          {count > 0 ? (
            <span
              key={count}
              className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 animate-bump items-center justify-center rounded-full bg-accent px-1 text-[11px] font-extrabold text-gray-900 ring-2 ring-brand-600"
            >
              {count}
            </span>
          ) : null}
        </Link>
      </Tooltip>
    </div>
  );
}
