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
        tone === 'light' ? 'text-[27px] tracking-[-0.8px] text-white' : 'text-[26px] text-gray-900',
      )}
    >
      {/* Mark: a shopping bag in the accent colour. */}
      <span
        aria-hidden
        className={cn(
          'mr-1.5 flex h-[42px] w-[42px] flex-none -rotate-6 items-center justify-center rounded-[13px] transition-transform duration-300 hover:rotate-0',
          tone === 'light'
            ? 'bg-gradient-to-br from-[#ffe066] to-[#ffc61a] text-gray-900 shadow-[0_6px_14px_-4px_rgba(255,198,26,.6),inset_0_1px_0_rgba(255,255,255,.6)]'
            : 'bg-brand-600 text-white',
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-5 w-5">
          <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
          <path d="M9 8V7a3 3 0 0 1 6 0v1" strokeLinecap="round" />
        </svg>
      </span>
      {name}
      <span aria-hidden className={cn('-ml-1.5', tone === 'light' ? 'text-accent' : 'text-brand-600')}>
        .
      </span>
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
