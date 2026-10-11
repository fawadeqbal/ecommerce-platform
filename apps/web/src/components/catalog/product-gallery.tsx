'use client';

/* eslint-disable @next/next/no-img-element -- images are served from object storage */
import { useState } from 'react';
import { cn } from '@ecommerce/ui';

export function ProductGallery({
  images,
  name,
}: {
  images: { url: string; altText: string | null }[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400">
        No image
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-xl border border-gray-200 bg-white">
        <img
          src={images[active].url}
          alt={images[active].altText ?? name}
          className="h-full w-full object-contain p-6"
        />
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              aria-label={`Show image ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                'aspect-square overflow-hidden rounded-lg border bg-white',
                i === active ? 'border-brand-600 ring-1 ring-brand-600' : 'border-gray-200',
              )}
            >
              <img src={img.url} alt="" className="h-full w-full object-contain p-1" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
