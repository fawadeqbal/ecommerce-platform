'use client';

/* eslint-disable @next/next/no-img-element -- banners are served from object storage */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { PublicBannerDto } from '@ecommerce/types';
import { cn } from '@ecommerce/ui';

export interface HeroSlide {
  tag: string;
  title: string;
  sub: string;
  cta: string;
  href: string;
  /** Tailwind background class. */
  bg: string;
}

/**
 * Rotating hero. CMS banners (Admin → Content → Banners, "home.hero") show as full images;
 * without banners the built-in text slides are used.
 */
export function HeroCarousel({
  banners,
  slides,
}: {
  banners: PublicBannerDto[];
  slides: HeroSlide[];
}) {
  const count = banners.length > 0 ? banners.length : slides.length;
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setActive((a) => (a + 1) % count), 5500);
    return () => clearInterval(t);
  }, [count]);

  return (
    <div className="relative h-[clamp(340px,34vw,440px)] overflow-hidden rounded-3xl bg-gray-900">
      {banners.length > 0
        ? banners.map((b, i) => {
            const img = (
              <picture>
                {b.mobileImageUrl ? (
                  <source media="(max-width: 640px)" srcSet={b.mobileImageUrl} />
                ) : null}
                <img src={b.imageUrl} alt={b.title} className="h-full w-full object-cover" />
              </picture>
            );
            return (
              <div
                key={b.id}
                aria-hidden={i !== active}
                className={cn(
                  'absolute inset-0 transition-opacity duration-500',
                  i === active ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
              >
                {b.linkUrl ? (
                  <Link href={b.linkUrl} className="block h-full" tabIndex={i === active ? 0 : -1}>
                    {img}
                  </Link>
                ) : (
                  img
                )}
              </div>
            );
          })
        : slides.map((s, i) => (
            <div
              key={s.title}
              aria-hidden={i !== active}
              className={cn(
                'absolute inset-0 flex overflow-hidden transition-opacity duration-500',
                s.bg,
                i === active ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              {/* Decorative shapes where a photo would sit. */}
              <div aria-hidden className="absolute inset-y-0 right-0 hidden w-1/2 md:block">
                <span className="absolute -right-16 top-1/2 h-[120%] w-[120%] -translate-y-1/2 rounded-full bg-white/10" />
                <span className="absolute bottom-10 right-24 h-40 w-40 rounded-full bg-accent/90" />
                <span className="absolute right-60 top-12 h-16 w-16 rounded-2xl bg-white/25" />
              </div>
              <div className="relative flex max-w-full flex-col justify-center gap-3.5 p-[clamp(24px,4.4vw,60px)] md:max-w-[52%]">
                <span className="-rotate-2 self-start rounded-full bg-accent px-3 py-1.5 text-[13px] font-bold text-gray-900">
                  {s.tag}
                </span>
                <h1 className="text-balance text-[clamp(32px,5vw,66px)] font-extrabold leading-[.98] tracking-display text-white">
                  {s.title}
                </h1>
                <p className="text-[clamp(15px,1.4vw,18px)] text-brand-100">{s.sub}</p>
                <Link
                  href={s.href}
                  tabIndex={i === active ? 0 : -1}
                  className="self-start rounded-2xl bg-white px-6 py-3.5 font-bold text-gray-900 hover:text-brand-600"
                >
                  {s.cta}
                </Link>
              </div>
            </div>
          ))}
      {count > 1 ? (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-gray-900/35 px-2 py-1.5">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className={cn(
                'h-2 rounded bg-white transition-all duration-300',
                i === active ? 'w-[26px] opacity-100' : 'w-2 opacity-50',
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
