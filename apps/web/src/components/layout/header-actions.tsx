'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart, useMe } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useLocale } from '@/components/locale/locale-provider';
import { authApi } from '@/lib/api-client';

const link = 'whitespace-nowrap rounded-lg px-2.5 py-[9px] text-white hover:text-white/80';

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
    <div className="flex items-center gap-1.5 text-sm font-semibold">
      <Link href="/track-order" className={`${link} hidden xl:inline`}>
        {t('header.trackOrder')}
      </Link>
      <Link
        href={me ? '/account/wishlist' : '/login?next=/account/wishlist'}
        className={`${link} hidden lg:inline`}
      >
        {t('header.wishlist')}
        {saved > 0 ? ` (${saved})` : ''}
      </Link>
      {me ? (
        <>
          <Link href="/account/orders" className={link}>
            {t('header.hi', { name: me.firstName })}
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="hidden px-2 py-[9px] text-[13px] font-medium text-white/70 hover:text-white xl:inline"
          >
            {t('header.signOut')}
          </button>
        </>
      ) : (
        <Link href="/login" className={link}>
          {t('header.signIn')}
        </Link>
      )}
      <Link
        href="/cart"
        className="flex items-center gap-2 rounded-[14px] bg-white px-3.5 py-[9px] text-gray-900 hover:text-brand-600"
      >
        {t('header.cart')}
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
