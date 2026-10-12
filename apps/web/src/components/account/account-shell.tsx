'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { Spinner, cn } from '@ecommerce/ui';
import { container } from '@/components/layout/container';
import { useMe } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { authApi, loyaltyApi, queryKeys } from '@/lib/api-client';

const NAV = [
  { href: '/account/orders', label: 'Orders' },
  { href: '/account/returns', label: 'Returns' },
  { href: '/account/wishlist', label: 'Wishlist', count: 'wishlist' as const },
  { href: '/account/loyalty', label: 'Points & rewards', count: 'points' as const },
  { href: '/account/addresses', label: 'Addresses' },
  { href: '/account/profile', label: 'Profile' },
  { href: '/account/preferences', label: 'Preferences' },
];

/** Account area: member card + side navigation + sign-in gate. */
export function AccountShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me, isPending } = useMe();
  const wishlist = useWishlist();
  const loyalty = useQuery({
    queryKey: queryKeys.loyalty.summary,
    queryFn: loyaltyApi.summary,
    enabled: Boolean(me),
    staleTime: 60_000,
  });

  const signOut = async () => {
    await authApi.logout().catch(() => undefined);
    queryClient.clear();
    router.push('/');
    router.refresh();
  };

  if (isPending) return <Spinner className="mx-auto p-8" />;
  if (!me) {
    return (
      <div className={`${container} max-w-[520px] py-12`}>
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center">
          <h1 className="text-2xl font-extrabold tracking-heading">Sign in to your account</h1>
          <p className="text-gray-500">
            See your orders, points and saved addresses. Checked out as a guest? Track your order
            instead.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2.5">
            <Link
              href={`/login?next=${encodeURIComponent(pathname)}`}
              className="rounded-2xl bg-brand-600 px-6 py-3.5 font-bold text-white hover:bg-brand-700 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/track-order"
              className="rounded-2xl bg-brand-100 px-6 py-3.5 font-bold text-brand-700"
            >
              Track an order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initials = `${me.firstName.charAt(0)}${me.lastName.charAt(0)}`.toUpperCase();
  const counts = {
    wishlist: wishlist.data?.items.length,
    points: loyalty.data?.points,
  };

  return (
    <div
      className={`${container} flex max-w-[1240px] flex-wrap items-start gap-5 pb-14 pt-[clamp(16px,2.4vw,28px)]`}
    >
      <aside className="flex max-w-full flex-[1_1_240px] flex-col gap-3">
        <div className="flex items-center gap-3 rounded-3xl bg-brand-600 p-[18px] text-white">
          <span className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full bg-accent text-xl font-extrabold text-gray-900">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[17px] font-extrabold">
              {me.firstName} {me.lastName}
            </p>
            <p className="text-[13px] text-brand-100">
              {loyalty.data
                ? `${loyalty.data.tier ? `${loyalty.data.tier.name} member · ` : ''}${loyalty.data.points.toLocaleString()} pts`
                : me.email}
            </p>
          </div>
        </div>
        <nav aria-label="Account" className="flex flex-col gap-0.5 rounded-3xl bg-white p-2">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            const count = item.count ? counts[item.count] : undefined;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center justify-between rounded-[14px] px-3.5 py-[11px] text-[15px]',
                  active
                    ? 'bg-brand-100 font-bold text-brand-700 hover:text-brand-700'
                    : 'font-medium text-gray-900 hover:bg-gray-50',
                )}
              >
                {item.label}
                {count ? (
                  <span className="text-xs font-bold text-gray-500">{count.toLocaleString()}</span>
                ) : null}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={signOut}
            className="px-3.5 py-[11px] text-left text-[15px] font-semibold text-red-600 hover:text-red-700"
          >
            Sign out
          </button>
        </nav>
      </aside>
      <div className="flex min-w-0 flex-[4_1_560px] flex-col gap-3.5">
        {!me.emailVerifiedAt && !pathname.startsWith('/account/profile') ? (
          <div className="rounded-2xl bg-accent-soft px-4 py-3 text-sm text-gray-600">
            Please verify your email address.{' '}
            <Link href="/account/profile" className="font-bold text-gray-900 underline">
              Send the link again
            </Link>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
