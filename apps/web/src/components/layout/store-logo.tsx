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
