import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@ecommerce/ui';

export function SectionHead({
  title,
  href,
  linkLabel = 'See all',
  tone = 'dark',
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  tone?: 'dark' | 'light';
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3.5">
        <h2
          className={cn(
            'font-extrabold',
            tone === 'light'
              ? 'text-[clamp(28px,3.8vw,48px)] leading-none tracking-display text-white'
              : 'text-[clamp(24px,2.8vw,34px)] tracking-heading text-gray-900',
          )}
        >
          {title}
        </h2>
        {children}
      </div>
      {href ? (
        <Link
          href={href}
          className={cn(
            'text-sm font-semibold',
            tone === 'light'
              ? 'rounded-[14px] bg-white/[.16] px-4 py-2.5 font-bold text-white hover:bg-white/25 hover:text-white'
              : 'text-brand-600 hover:text-brand-800',
          )}
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}

/** Responsive product grid used by the home rows. */
export const productGrid =
  'grid grid-cols-[repeat(auto-fill,minmax(clamp(150px,16vw,210px),1fr))] gap-3';
