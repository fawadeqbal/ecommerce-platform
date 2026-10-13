'use client';

/* eslint-disable @next/next/no-img-element -- images are served from object storage */
import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
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
  const [dir, setDir] = useState(1);
  const [lbZoom, setLbZoom] = useState<{ x: number; y: number } | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const go = useCallback(
    (k: number) => {
      setI((prev) => {
        const next = ((k % n) + n) % n;
        setDir(next >= prev ? 1 : -1);
        return next;
      });
      setLbZoom(null);
    },
    [n],
  );
  // Keep the active thumbnail in view.
  useEffect(() => {
    railRef.current
      ?.querySelectorAll('[data-thumb]')
      [i]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [i]);
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
    onTouchStart: (e: TouchEvent) => (touchX.current = e.touches[0]?.clientX ?? null),
    onTouchEnd: (e: TouchEvent) => {
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
          'scrollbar-none flex gap-2.5 p-1.5',
          vertical ? 'flex-col overflow-y-auto' : 'overflow-x-auto',
        )}
      >
        {list.map((img, k) => (
          <button
            key={img.url + k}
            type="button"
            aria-label={`Photo ${k + 1}`}
            aria-current={k === i}
            data-thumb
            onMouseEnter={() => !dark && k !== i && go(k)}
            onClick={() => go(k)}
            className={cn(
              'relative h-[72px] w-[72px] flex-none overflow-hidden rounded-2xl p-1.5 transition-all duration-200',
              dark ? 'bg-white/10' : 'bg-[#f6f6f8]',
              k === i
                ? 'scale-[1.04] ring-2 ring-brand-600 shadow-[0_6px_16px_-6px_rgba(83,43,199,.5)]'
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
        className="group/stage relative aspect-square min-w-0 flex-1 cursor-zoom-in overflow-hidden rounded-[28px] bg-[#f6f6f8] ring-1 ring-black/[.04]"
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
            className="gal-in h-full w-full object-contain p-[6%] mix-blend-multiply transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] will-change-transform"
            style={{
              ['--gal-dx' as string]: `${dir * 28}px`,
              transform: zoom ? 'scale(2.2)' : 'scale(1)',
              transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : '50% 50%',
            }}
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
          <span className="absolute bottom-4 left-4 hidden rounded-full bg-gray-900/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm md:block">
            {i + 1} / {n}
          </span>
        ) : null}
        {cur.url ? (
          <span className="pointer-events-none absolute bottom-4 right-4 hidden items-center gap-1.5 rounded-full bg-white/90 opacity-0 transition-opacity group-hover/stage:opacity-100 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm md:flex">
            🔍 Hover to zoom · click to expand
          </span>
        ) : null}
        {arrow(-1)}
        {arrow(1)}
        {n > 1 ? (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 md:hidden">
            {list.map((_, k) => (
              <span
                key={k}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  k === i ? 'w-5 bg-brand-600' : 'w-1.5 bg-gray-300',
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
      <style>
        {'.gal-in{animation:gal-in .45s cubic-bezier(.22,1,.36,1) both}' +
          '@keyframes gal-in{from{opacity:0;translate:var(--gal-dx,28px) 0}to{opacity:1;translate:0 0}}' +
          '@media (prefers-reduced-motion:reduce){.gal-in{animation:none}}'}
      </style>

      {/* Thumbnails: rail on desktop, row on phones */}
      <div ref={railRef} className="md:max-h-[560px]">
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
                <span className="ml-2 hidden text-white/50 sm:inline">· click photo to zoom</span>
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
              <div
                className="max-h-full max-w-full overflow-hidden rounded-2xl bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  const r = e.currentTarget.getBoundingClientRect();
                  setLbZoom((z) =>
                    z ? null : { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 },
                  );
                }}
                onMouseMove={(e) => {
                  if (!lbZoom) return;
                  const r = e.currentTarget.getBoundingClientRect();
                  setLbZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
                }}
              >
                <img
                  key={cur.url}
                  src={cur.url}
                  alt={cur.altText ?? name}
                  className={cn(
                    'gal-in max-h-[calc(100dvh-200px)] max-w-full object-contain p-4 transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]',
                    lbZoom ? 'cursor-zoom-out' : 'cursor-zoom-in',
                  )}
                  style={{
                    ['--gal-dx' as string]: `${dir * 40}px`,
                    transform: lbZoom ? 'scale(2.5)' : 'scale(1)',
                    transformOrigin: lbZoom ? `${lbZoom.x}% ${lbZoom.y}%` : '50% 50%',
                  }}
                />
              </div>
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
