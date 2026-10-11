'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart, useMe } from '@/hooks/use-cart';
import { authApi } from '@/lib/api-client';

export function HeaderActions() {
  const { data: cart } = useCart();
  const { data: me } = useMe();
  const router = useRouter();
  const queryClient = useQueryClient();
  const count = cart?.itemCount ?? 0;

  const signOut = async () => {
    await authApi.logout().catch(() => undefined);
    queryClient.clear();
    router.refresh();
  };

  return (
    <div className="flex items-center gap-4 text-sm">
      <Link href="/cart" className="relative font-medium hover:text-brand-700">
        Cart
        {count > 0 ? (
          <span className="absolute -right-4 -top-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-semibold text-white">
            {count}
          </span>
        ) : null}
      </Link>
      {me ? (
        <>
          <Link href="/account/orders" className="ml-3 hover:text-brand-700">
            Hi, {me.firstName}
          </Link>
          <button type="button" onClick={signOut} className="text-gray-500 hover:text-gray-800">
            Sign out
          </button>
        </>
      ) : (
        <>
          <Link href="/track-order" className="ml-3 hover:text-brand-700">
            Track order
          </Link>
          <Link href="/login" className="font-medium text-brand-700">
            Sign in
          </Link>
        </>
      )}
    </div>
  );
}
