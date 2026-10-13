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
      {/* Mark: the "e-cart" — an e that becomes a cart, with yellow wheels. */}
      <EcartMark tone={tone} className="mr-0.5 h-9 w-9 flex-none" />
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

/** The brand mark (e-cart). Light = for the violet header, dark = for white backgrounds. */
export function EcartMark({ tone = 'light', className }: { tone?: 'light' | 'dark'; className?: string }) {
  const ink = tone === 'light' ? '#fff' : '#1E1A33';
  const arc = tone === 'light' ? '#fff' : '#5B3FD9';
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <path d="M4 9h5l2.5 6" fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 29h30a15 15 0 1 0-4.4 10.6" fill="none" stroke={arc} strokeWidth={7.5} strokeLinecap="round" />
      <circle cx="22" cy="55" r="5" fill={tone === 'light' ? '#FFD12E' : '#1E1A33'} />
      <circle cx="42" cy="55" r="5" fill="#FFD12E" />
    </svg>
  );
}
