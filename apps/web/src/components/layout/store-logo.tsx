/* eslint-disable @next/next/no-img-element -- the logo comes from object storage */
import Link from 'next/link';
import { cn } from '@ecommerce/ui';

/** Store name with the dot mark (or the uploaded logo). `tone` = on violet (header) or on white. */
export function StoreLogo({
  name,
  logoUrl,
  tone = 'light',
  href = '/',
}: {
  name: string;
  logoUrl?: string | null;
  tone?: 'light' | 'dark';
  href?: string | null;
}) {
  const mark = logoUrl ? (
    <img src={logoUrl} alt={name} className="h-8 w-auto" />
  ) : (
    <span
      className={cn(
        'flex items-center gap-1.5 font-extrabold leading-none tracking-display',
        tone === 'light' ? 'text-[28px] text-white' : 'text-[26px] text-gray-900',
      )}
    >
      {/* Mark: a shopping bag in the accent colour. */}
      <span
        aria-hidden
        className={cn(
          'mr-1 flex h-9 w-9 flex-none -rotate-6 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 hover:rotate-0',
          tone === 'light' ? 'bg-accent text-gray-900' : 'bg-brand-600 text-white',
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-5 w-5">
          <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
          <path d="M9 8V7a3 3 0 0 1 6 0v1" strokeLinecap="round" />
        </svg>
      </span>
      {name}
      <span
        aria-hidden
        className={cn(
          'inline-block rounded-full',
          tone === 'light' ? 'h-2.5 w-2.5 bg-accent' : 'h-[9px] w-[9px] bg-brand-600',
        )}
      />
    </span>
  );
  return href ? (
    <Link href={href} aria-label={`${name} home`} className="shrink-0">
      {mark}
    </Link>
  ) : (
    mark
  );
}
