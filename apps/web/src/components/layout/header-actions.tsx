'use client';

import Link from 'next/link';
import { useCart, useMe } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useLocale } from '@/components/locale/locale-provider';
import { CartIcon, HeartIcon, UserIcon } from '@/components/icons';
import { Tooltip } from '@ecommerce/ui';
import { AccountMenu } from './account-menu';

/** Right side of the violet header: account, wishlist, cart (Header.dc design). */
export function HeaderActions() {
  const { data: cart } = useCart();
  const { t, money } = useLocale();
  const { data: me } = useMe();
  const count = cart?.itemCount ?? 0;
  const saved = useWishlist().data?.items.length ?? 0;

  return (
    <div className="flex flex-none items-center gap-2 text-white">
      {me ? (
        <AccountMenu
          firstName={me.firstName}
          lastName={me.lastName}
          email={me.email}
          greeting={t('header.hi', { name: me.firstName })}
          wishlistCount={saved}
        />
      ) : (
        <Link
          href="/login"
          className="flex h-12 items-center gap-2.5 rounded-[14px] border border-transparent pl-1.5 pr-1.5 text-white transition-colors hover:border-white/15 hover:bg-white/10 hover:text-white lg:pr-3.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[.14] shadow-[inset_0_0_0_1px_rgba(255,255,255,.22)]">
            <UserIcon size={18} />
          </span>
          <span className="hidden flex-col leading-[1.15] lg:flex">
            <span className="hidden text-xs text-brand-100 xl:inline">Hello, guest</span>
            <span className="text-[15px] font-semibold">{t('header.signIn')}</span>
          </span>
        </Link>
      )}

      <Tooltip content="Wishlist">
        <Link
          href="/account/wishlist"
          aria-label={`Wishlist (${saved})`}
          className="relative hidden h-12 w-12 place-items-center rounded-[14px] bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.18)] transition-colors hover:bg-white/[.18] hover:text-white sm:grid"
        >
          <HeartIcon size={20} />
          {saved > 0 ? (
            <span className="absolute right-[11px] top-[11px] h-2 w-2 rounded-full bg-accent shadow-[0_0_0_2px_#5a3ddb]" />
          ) : null}
        </Link>
      </Tooltip>

      <Link
        href="/cart"
        aria-label={`${t('header.cart')} (${count})`}
        className="flex h-12 items-center gap-3 rounded-[14px] bg-white pl-[7px] pr-1.5 text-gray-900 shadow-[0_10px_22px_-10px_rgba(20,8,70,.6)] transition-colors hover:bg-[#fffbea] hover:text-gray-900 lg:pr-4"
      >
        <span className="relative grid h-9 w-9 place-items-center rounded-[11px] bg-brand-50 text-brand-600">
          <CartIcon size={20} />
          {count > 0 ? (
            <span
              key={count}
              className="absolute -right-[7px] -top-1.5 grid h-[19px] min-w-[19px] animate-bump place-items-center rounded-[10px] bg-accent px-[5px] text-[11px] font-extrabold text-gray-900 shadow-[0_0_0_2px_#fff]"
            >
              {count}
            </span>
          ) : null}
        </span>
        <span className="hidden flex-col leading-[1.15] lg:flex">
          <span className="text-xs text-gray-500">{t('header.cart')}</span>
          <span className="text-[15px] font-bold tracking-[-0.2px]">
            {cart ? money(cart.subtotal, cart.currency) : '—'}
          </span>
        </span>
      </Link>
    </div>
  );
}
