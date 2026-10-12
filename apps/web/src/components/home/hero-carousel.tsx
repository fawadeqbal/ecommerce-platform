'use client';

/* eslint-disable @next/next/no-img-element -- banners and products are served from object storage */
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PublicBannerDto } from '@ecommerce/types';
import { cn } from '@ecommerce/ui';

export interface HeroProduct {
  name: string;
  slug: string;
  imageUrl: string | null;
}

export interface HeroSlide {
  tag: string;
  title: string;
  sub: string;
  cta: string;
  href: string;
  /** Tailwind background class. */
  bg: string;
  /** Live products shown on the slide (up to 3). */
  products?: HeroProduct[];
}

const INTERVAL = 6000;

/**
 * Rotating hero. CMS banners (Admin → Content → Banners, "home.hero") show as full images;
 * without banners the built-in slides are used, decorated with live products.
 * Swipe on phones, dots everywhere, pauses while hovered.
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
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback((i: number) => setActive(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    const t = setTimeout(() => go(active + 1), INTERVAL);
    return () => clearTimeout(t);
  }, [active, count, paused, go]);

  return (
    <div
      className="group/hero relative h-[clamp(420px,40vw,480px)] overflow-hidden rounded-[28px] bg-gray-900 sm:h-[clamp(360px,36vw,480px)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        touchX.current = null;
        if (start == null || end == null || Math.abs(end - start) < 40) return;
        go(active + (end < start ? 1 : -1));
      }}
    >
      {banners.length > 0
        ? banners.map((b, i) => {
            const img = (
              <picture>
                {b.mobileImageUrl ? (
                  <source media="(max-width: 640px)" srcSet={b.mobileImageUrl} />
                ) : null}
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  className={cn(
                    'h-full w-full object-cover transition-transform duration-[6000ms] ease-linear',
                    i === active ? 'scale-105' : 'scale-100',
                  )}
                />
              </picture>
            );
            return (
              <div
                key={b.id}
                aria-hidden={i !== active}
                className={cn(
                  'absolute inset-0 transition-opacity duration-700',
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
        : slides.map((s, i) => {
            const on = i === active;
            const items = (s.products ?? []).filter((p) => p.imageUrl).slice(0, 3);
            return (
              <div
                key={s.title}
                aria-hidden={!on}
                className={cn(
                  'absolute inset-0 flex flex-col overflow-hidden transition-opacity duration-700 md:flex-row',
                  s.bg,
                  on ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
              >
                {/* Soft light shapes. */}
                <span
                  aria-hidden
                  className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-white/10"
                />
                <span
                  aria-hidden
                  className="absolute -bottom-32 right-1/3 h-72 w-72 rounded-full bg-accent/20 blur-2xl"
                />
                <span
                  aria-hidden
                  className="absolute left-[46%] top-10 hidden h-3 w-3 rounded-full bg-accent md:block"
                />

                {/* Copy */}
                <div
                  className={cn(
                    'relative z-10 flex flex-col justify-center gap-3 p-[clamp(22px,4.4vw,60px)] pb-2 transition-all duration-700 md:w-[54%] md:gap-4 md:pb-[clamp(22px,4.4vw,60px)]',
                    on ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                  )}
                >
                  <span className="-rotate-2 self-start rounded-full bg-accent px-3 py-1.5 text-[12px] font-extrabold uppercase tracking-wide text-gray-900 sm:text-[13px]">
                    {s.tag}
                  </span>
                  <h1 className="text-balance text-[clamp(30px,5vw,64px)] font-extrabold leading-[.98] tracking-display text-white">
                    {s.title}
                  </h1>
                  <p className="max-w-md text-[clamp(14px,1.4vw,18px)] text-white/75">{s.sub}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <Link
                      href={s.href}
                      tabIndex={on ? 0 : -1}
                      className="group/cta inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-gray-900 shadow-lg shadow-black/10 transition-colors hover:bg-accent sm:px-6 sm:py-3.5"
                    >
                      {s.cta}
                      <span className="transition-transform group-hover/cta:translate-x-1">→</span>
                    </Link>
                    <span className="hidden text-sm font-semibold text-white/70 sm:inline">
                      Cash on delivery · Easy returns
                    </span>
                  </div>
                </div>

                {/* Live products: a fanned stack on desktop, a neat row on phones. */}
                {items.length > 0 ? (
                  <div className="relative z-10 flex flex-1 items-center justify-center px-5 pb-12 md:px-8 md:pb-0">
                    <div className="flex w-full max-w-[460px] items-end justify-center gap-3 md:relative md:h-[320px] md:gap-0">
                      {items.map((p, k) => (
                        <Link
                          key={p.slug}
                          href={`/products/${p.slug}`}
                          tabIndex={on ? 0 : -1}
                          title={p.name}
                          className={cn(
                            'flex aspect-square w-[30%] flex-none items-center justify-center rounded-3xl bg-white p-2 shadow-xl shadow-black/20 transition-all duration-700 hover:z-20 hover:scale-105 md:absolute md:w-[52%] md:p-4',
                            k === 0 && 'md:left-1/2 md:top-1/2 md:z-10 md:-translate-x-1/2 md:-translate-y-1/2',
                            k === 1 && 'md:left-0 md:top-6 md:w-[40%] md:-rotate-6',
                            k === 2 && 'md:bottom-4 md:right-0 md:w-[40%] md:rotate-6',
                            on ? 'opacity-100' : 'opacity-0',
                          )}
                          style={{ transitionDelay: on ? `${150 + k * 120}ms` : '0ms' }}
                        >
                          <img
                            src={p.imageUrl!}
                            alt={p.name}
                            loading={i === 0 ? 'eager' : 'lazy'}
                            className="h-full w-full object-contain mix-blend-multiply"
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}

      {count > 1 ? (
        <>
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/25 px-2.5 py-2 backdrop-blur-sm">
            {Array.from({ length: count }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                aria-current={i === active}
                onClick={() => go(i)}
                className={cn(
                  'relative h-2 overflow-hidden rounded-full bg-white/40 transition-all duration-300',
                  i === active ? 'w-8' : 'w-2 hover:bg-white/70',
                )}
              >
                {i === active ? (
                  <span
                    key={`${active}-${paused}`}
                    className="absolute inset-y-0 left-0 rounded-full bg-white"
                    style={{
                      animation: paused ? 'none' : `hero-progress ${INTERVAL}ms linear forwards`,
                      width: paused ? '100%' : undefined,
                    }}
                  />
                ) : null}
              </button>
            ))}
          </div>
          <style>{'@keyframes hero-progress{from{width:0}to{width:100%}}'}</style>
        </>
      ) : null}
    </div>
  );
}
