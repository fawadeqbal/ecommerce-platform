'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Card, Spinner, buttonStyles, cn } from '@ecommerce/ui';
import { useMe } from '@/hooks/use-cart';

const NAV = [
  { href: '/account/orders', label: 'Orders' },
  { href: '/account/returns', label: 'Returns' },
  { href: '/account/wishlist', label: 'Wishlist' },
  { href: '/account/loyalty', label: 'Points' },
  { href: '/account/addresses', label: 'Addresses' },
  { href: '/account/profile', label: 'Profile' },
  { href: '/account/preferences', label: 'Preferences' },
];

/** Account area: side navigation + sign-in gate. */
export function AccountShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: me, isPending } = useMe();

  if (isPending) return <Spinner className="mx-auto max-w-5xl p-8" />;
  if (!me) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <Card className="space-y-4 text-center">
          <h1 className="text-xl font-semibold text-gray-900">Sign in to your account</h1>
          <p className="text-sm text-gray-600">
            See your orders and saved addresses. Checked out as a guest? Track your order instead.
          </p>
          <div className="flex justify-center gap-3">
            <Link href={`/login?next=${encodeURIComponent(pathname)}`} className={buttonStyles()}>
              Sign in
            </Link>
            <Link href="/track-order" className={buttonStyles({ variant: 'outline' })}>
              Track an order
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[200px_1fr]">
      <nav className="space-y-1 text-sm">
        <p className="mb-3 px-3 font-semibold text-gray-900">
          {me.firstName} {me.lastName}
        </p>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'block rounded-lg px-3 py-2',
              pathname.startsWith(item.href)
                ? 'bg-brand-50 font-medium text-brand-700'
                : 'text-gray-700 hover:bg-gray-100',
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="min-w-0 space-y-4">
        {!me.emailVerifiedAt && !pathname.startsWith('/account/profile') ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
            Please verify your email address.{' '}
            <Link href="/account/profile" className="font-medium underline">
              Send the link again
            </Link>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
