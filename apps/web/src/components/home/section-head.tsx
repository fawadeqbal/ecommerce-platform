import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@ecommerce/ui';

export function SectionHead({
  title,
  eyebrow,
  href,
  linkLabel = 'See all',
  tone = 'dark',
  children,
}: {
  title: string;
  /** Small label above the title (e.g. "Trending"). */
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
  tone?: 'dark' | 'light';
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-wrap items-end gap-x-3.5 gap-y-2">
        <div>
          {eyebrow ? (
            <p
              className={cn(
                'mb-0.5 text-xs font-bold uppercase tracking-[0.14em]',
                tone === 'light' ? 'text-accent' : 'text-brand-600',
              )}
            >
              {eyebrow}
            </p>
          ) : null}
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
        </div>
        {children}
      </div>
      {href ? (
        <Link
          href={href}
          className={cn(
            'group/link inline-flex flex-none items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-colors',
            tone === 'light'
              ? 'bg-white/[.16] text-white hover:bg-white/25 hover:text-white'
              : 'bg-gray-900 text-white hover:bg-brand-700 hover:text-white',
          )}
        >
          {linkLabel.replace(/\s*→$/, '')}
          <span aria-hidden className="transition-transform group-hover/link:translate-x-0.5">
            →
          </span>
        </Link>
      ) : null}
    </div>
  );
}

/**
 * Home product rows: a swipeable row on phones (cards snap into place),
 * a responsive grid from tablets up.
 */
export const productGrid =
  'scrollbar-none -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:snap-none md:grid-cols-4 md:gap-4 md:overflow-visible lg:grid-cols-5 md:px-0 [&>*]:w-[46%] [&>*]:flex-none [&>*]:snap-start sm:[&>*]:w-[31%] md:[&>*]:w-auto';
