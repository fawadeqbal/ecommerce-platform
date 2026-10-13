'use client';

/* eslint-disable @next/next/no-img-element -- images are served from object storage */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Portal, cn } from '@ecommerce/ui';

type Img = { url: string; altText: string | null };

/**
 * Product media viewer: thumbnail rail + main stage with hover zoom, swipe on phones,
 * and a full-screen lightbox (arrows, thumbnails, keyboard).
 */
export function ProductGallery({
  images,
  name,
  discount,
}: {
  images: Img[];
  name: string;
  discount?: number | null;
}) {
  const list = images.length > 0 ? images : [{ url: '', altText: null }];
  const n = list.length;
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [full, setFull] = useState(false);
  const touchX = useRef<number | null>(null);
  const go = useCallback((k: number) => setI(((k % n) + n) % n), [n]);
  const cur = list[i]!;

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFull(false);
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'ArrowLeft') go(i - 1);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [full, i, go]);

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => (touchX.current = e.touches[0]?.clientX ?? null),
    onTouchEnd: (e: React.TouchEvent) => {
      const s = touchX.current;
      const end = e.changedTouches[0]?.clientX;
      touchX.current = null;
      if (s != null && end != null && Math.abs(end - s) > 40) go(i + (end < s ? 1 : -1));
    },
  };

  const arrow = (dir: -1 | 1, big = false) =>
    n > 1 ? (
      <button
        type="button"
        aria-label={dir < 0 ? 'Previous photo' : 'Next photo'}
        onClick={(e) => {
          e.stopPropagation();
          go(i + dir);
        }}
        className={cn(
          'absolute top-1/2 z-10 grid -translate-y-1/2 place-items-center rounded-full bg-white/95 text-xl font-bold text-gray-900 shadow-lg transition-all hover:scale-105 hover:bg-white',
          big ? 'h-12 w-12' : 'h-10 w-10 opacity-0 group-hover/stage:opacity-100',
          dir < 0 ? (big ? 'left-4' : 'left-3') : big ? 'right-4' : 'right-3',
        )}
      >
        {dir < 0 ? '‹' : '›'}
      </button>
    ) : null;

  const thumbs = (vertical: boolean, dark = false) =>
    n > 1 ? (
      <div
        className={cn(
          'scrollbar-none flex gap-2.5',
          vertical ? 'flex-col overflow-y-auto' : 'overflow-x-auto',
        )}
      >
        {list.map((img, k) => (
          <button
            key={img.url + k}
            type="button"
            aria-label={`Photo ${k + 1}`}
            aria-current={k === i}
            onMouseEnter={() => !dark && setI(k)}
            onClick={() => setI(k)}
            className={cn(
              'relative h-[72px] w-[72px] flex-none overflow-hidden rounded-2xl p-1.5 transition-all duration-200',
              dark ? 'bg-white/10' : 'bg-white',
              k === i
                ? 'ring-2 ring-brand-600'
                : cn('ring-1', dark ? 'opacity-60 ring-white/10 hover:opacity-100' : 'ring-gray-200 hover:ring-gray-300'),
            )}
          >
            <img
              src={img.url}
              alt=""
              className={cn('h-full w-full object-contain', !dark && 'mix-blend-multiply')}
            />
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div className="flex flex-col gap-3 md:flex-row-reverse">
      {/* Stage */}
      <div
        className="group/stage relative aspect-square min-w-0 flex-1 cursor-zoom-in overflow-hidden rounded-[28px] bg-white"
        onMouseMove={(e) => {
          if (!window.matchMedia('(hover: hover)').matches) return;
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
        onClick={() => cur.url && setFull(true)}
        {...swipe}
      >
        {cur.url ? (
          <img
            key={cur.url}
            src={cur.url}
            alt={cur.altText ?? name}
            className="h-full w-full animate-fade-in object-contain p-[6%] mix-blend-multiply transition-transform duration-200 ease-out"
            style={
              zoom
                ? { transform: 'scale(2)', transformOrigin: `${zoom.x}% ${zoom.y}%` }
                : undefined
            }
          />
        ) : (
          <div className="grid h-full place-items-center text-6xl text-gray-300">🛍️</div>
        )}
        {discount ? (
          <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-sm font-extrabold text-gray-900">
            −{discount}%
          </span>
        ) : null}
        {n > 1 ? (
          <span className="absolute bottom-4 left-4 rounded-full bg-gray-900/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {i + 1} / {n}
          </span>
        ) : null}
        {cur.url ? (
          <span className="pointer-events-none absolute bottom-4 right-4 hidden items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm md:flex">
            🔍 Hover to zoom · click to expand
          </span>
        ) : null}
        {arrow(-1)}
        {arrow(1)}
      </div>

      {/* Thumbnails: rail on desktop, row on phones */}
      <div className="md:max-h-[560px]">
        <div className="hidden h-full md:block">{thumbs(true)}</div>
        <div className="md:hidden">{thumbs(false)}</div>
      </div>

      {/* Lightbox */}
      {full ? (
        <Portal>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${name} photos`}
            className="fixed inset-0 z-[100] flex animate-fade-in flex-col bg-[#120d2b]/95 backdrop-blur-md"
            onClick={() => setFull(false)}
          >
            <div className="flex items-center justify-between px-5 py-4 text-white">
              <span className="truncate text-sm font-semibold text-white/80">
                {name} · {i + 1} / {n}
              </span>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setFull(false)}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xl hover:bg-white/20"
              >
                ×
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4" {...swipe}>
              <img
                key={cur.url}
                src={cur.url}
                alt={cur.altText ?? name}
                onClick={(e) => e.stopPropagation()}
                className="max-h-full max-w-full animate-pop-in rounded-2xl bg-white object-contain p-4"
              />
              {arrow(-1, true)}
              {arrow(1, true)}
            </div>
            <div className="flex justify-center px-4 py-4" onClick={(e) => e.stopPropagation()}>
              {thumbs(false, true)}
            </div>
          </div>
        </Portal>
      ) : null}
    </div>
  );
}
