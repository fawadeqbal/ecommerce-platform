/* eslint-disable @next/next/no-img-element -- brand logos are served from object storage */
import Link from 'next/link';
import type { BrandDto } from '@ecommerce/types';

/**
 * Endless, auto-scrolling strip of brand logos (pauses on hover, edges fade out).
 * The list is rendered twice and shifted by exactly one copy, so the loop has no seam.
 * Brands without a logo show as a clean wordmark.
 */
export function BrandMarquee({ brands }: { brands: Pick<BrandDto, 'id' | 'name' | 'slug' | 'logoUrl'>[] }) {
  if (brands.length === 0) return null;
  // Short lists are repeated so one copy is always wider than the screen.
  const base = brands.length < 8 ? [...brands, ...brands, ...brands].slice(0, 12) : brands;
  const seconds = Math.max(24, base.length * 3.2);

  const row = (copy: number) =>
    base.map((b, i) => (
      <Link
        key={`${copy}-${b.id}-${i}`}
        href={`/brands/${b.slug}`}
        aria-hidden={copy > 0 ? true : undefined}
        tabIndex={copy > 0 ? -1 : undefined}
        title={b.name}
        className="group/brand mr-3 flex h-20 w-[150px] flex-none items-center justify-center rounded-2xl bg-gray-50 px-5 ring-1 ring-black/[.04] transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-card sm:h-24 sm:w-[180px]"
      >
        {b.logoUrl ? (
          <img
            src={b.logoUrl}
            alt={b.name}
            loading="lazy"
            className="max-h-11 max-w-full object-contain opacity-70 grayscale transition-all duration-300 group-hover/brand:opacity-100 group-hover/brand:grayscale-0 sm:max-h-12"
          />
        ) : (
          <span className="truncate text-lg font-extrabold tracking-[-0.03em] text-gray-400 transition-colors duration-300 group-hover/brand:text-brand-700 sm:text-xl">
            {b.name}
          </span>
        )}
      </Link>
    ));

  return (
    <div className="brand-marquee group/marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
      <style>
        {'.brand-marquee__track{animation:brand-marquee var(--brand-speed) linear infinite}' +
          '.brand-marquee:hover .brand-marquee__track{animation-play-state:paused}' +
          '@keyframes brand-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}' +
          '@media (prefers-reduced-motion:reduce){.brand-marquee__track{animation:none}}'}
      </style>
      <div
        className="brand-marquee__track flex w-max py-2"
        style={{ ['--brand-speed' as string]: `${seconds}s` }}
      >
        {row(0)}
        {row(1)}
      </div>
    </div>
  );
}
