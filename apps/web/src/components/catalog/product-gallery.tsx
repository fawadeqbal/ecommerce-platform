'use client';

/* eslint-disable @next/next/no-img-element -- images are served from object storage */
import { useState } from 'react';
import { cn } from '@ecommerce/ui';

export function ProductGallery({
  images,
  name,
  discount = 0,
}: {
  images: { url: string; altText: string | null }[];
  name: string;
  /** Percent off, shown as the yellow pill. */
  discount?: number;
}) {
  const [active, setActive] = useState(0);
  const pill =
    discount > 0 ? (
      <span className="pointer-events-none absolute left-4 top-4 -rotate-[4deg] rounded-full bg-accent px-3 py-1.5 text-sm font-extrabold text-gray-900">
        −{discount}%
      </span>
    ) : null;
  if (images.length === 0) {
    return (
      <div className="relative flex aspect-square items-center justify-center rounded-3xl bg-white text-gray-400">
        No image
        {pill}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-white">
        {images.map((img, i) => (
          <img
            key={img.url}
            src={img.url}
            alt={img.altText ?? name}
            aria-hidden={i !== active}
            className={cn(
              'absolute inset-0 h-full w-full object-contain p-6 transition-opacity duration-300',
              i === active ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          />
        ))}
        {pill}
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              aria-label={`Show image ${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className={cn(
                'aspect-square overflow-hidden rounded-xl border-2 bg-white',
                i === active ? 'border-brand-600' : 'border-gray-200 hover:border-gray-300',
              )}
            >
              <img src={img.url} alt="" className="h-full w-full object-contain p-1.5" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
