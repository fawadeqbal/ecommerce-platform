'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart, useMe } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useLocale } from '@/components/locale/locale-provider';
import { authApi } from '@/lib/api-client';
import { CartIcon, HeartIcon, LogoutIcon, TruckIcon, UserIcon } from '@/components/icons';

const link =
  'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-[9px] text-white hover:bg-white/10 hover:text-white';

export function HeaderActions() {
  const { data: cart } = useCart();
  const { t } = useLocale();
  const { data: me } = useMe();
  const router = useRouter();
  const queryClient = useQueryClient();
  const count = cart?.itemCount ?? 0;
  const saved = useWishlist().data?.items.length ?? 0;

  const signOut = async () => {
    await authApi.logout().catch(() => undefined);
    queryClient.clear();
    router.refresh();
  };

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
        <>
          <Link href="/account/orders" title="My account" className={link}>
            <UserIcon />
            <span className="hidden md:inline">{t('header.hi', { name: me.firstName })}</span>
          </Link>
          <button
            type="button"
            onClick={signOut}
            title={t('header.signOut')}
            aria-label={t('header.signOut')}
            className="hidden rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white xl:flex"
          >
            <LogoutIcon size={18} />
          </button>
        </>
      ) : (
        <Link href="/login" className={link}>
          <UserIcon />
          <span className="hidden sm:inline">{t('header.signIn')}</span>
        </Link>
      )}
      <Link
        href="/cart"
        aria-label={`${t('header.cart')} (${count})`}
        className="ml-1 flex items-center gap-2 rounded-[14px] bg-white px-3 py-[9px] text-gray-900 hover:text-brand-600"
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
