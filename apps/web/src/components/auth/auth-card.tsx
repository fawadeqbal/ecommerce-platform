import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@ecommerce/ui';
import { getStoreSettings, storeName } from '@/lib/store-settings';

/**
 * Split sign-in layout: violet brand panel + form column. `mode` shows the
 * Sign in / Create account switch (login and register pages).
 */
export async function AuthCard({
  title,
  subtitle,
  children,
  footer,
  mode,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  mode?: 'login' | 'register';
}) {
  const name = storeName(await getStoreSettings());
  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-wrap">
      <div className="relative flex min-h-[280px] flex-[1_1_480px] flex-col justify-between gap-8 overflow-hidden bg-brand-600 p-[clamp(24px,4vw,56px)]">
        <span
          aria-hidden
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10"
        />
        <span
          aria-hidden
          className="absolute bottom-16 right-16 h-40 w-40 rounded-full bg-accent/90"
        />
        <span className="relative flex items-center gap-1.5 text-[30px] font-extrabold leading-none tracking-display text-white">
          {name}
          <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
        </span>
        <div className="relative flex max-w-[440px] flex-col gap-3">
          <span className="-rotate-2 self-start rounded-full bg-accent px-3 py-1.5 text-[13px] font-bold text-gray-900">
            Earn points on every order
          </span>
          <p className="text-balance text-[clamp(32px,4.4vw,56px)] font-extrabold leading-none tracking-display text-white">
            Everything you need, from sellers you can trust.
          </p>
        </div>
      </div>

      <div className="flex flex-[1_1_420px] items-center justify-center px-4 py-[clamp(24px,4vw,56px)]">
        <div className="flex w-full max-w-[420px] flex-col gap-4">
          {mode ? (
            <div className="flex gap-1 rounded-2xl bg-white p-1">
              {(
                [
                  ['login', 'Sign in', '/login'],
                  ['register', 'Create account', '/register'],
                ] as const
              ).map(([m, label, href]) => (
                <Link
                  key={m}
                  href={href}
                  aria-current={m === mode ? 'page' : undefined}
                  className={cn(
                    'flex-1 rounded-xl p-[11px] text-center font-bold',
                    m === mode
                      ? 'bg-brand-600 text-white hover:text-white'
                      : 'text-gray-600 hover:text-gray-900',
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          ) : null}
          <h1 className="text-[32px] font-extrabold leading-[1.05] tracking-display">{title}</h1>
          {subtitle ? <p className="-mt-2 text-gray-500">{subtitle}</p> : null}
          <div className="[&_input]:h-[50px] [&_input]:rounded-[14px] [&_input]:border-[1.5px] [&_input]:border-gray-200 [&_button[type=submit]]:h-[54px] [&_button[type=submit]]:rounded-2xl [&_button[type=submit]]:text-base [&_button[type=submit]]:font-bold">
            {children}
          </div>
          {footer ? <p className="text-center text-sm text-gray-600">{footer}</p> : null}
          {mode ? (
            <div className="flex flex-wrap justify-between gap-2.5 rounded-2xl bg-white px-4 py-3 text-sm text-gray-600">
              Checked out as a guest?
              <Link href="/track-order" className="font-bold text-brand-700">
                Track your order
              </Link>
            </div>
          ) : (
            <p className="text-center text-xs text-gray-500">
              <Link href="/">Back to the store</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
