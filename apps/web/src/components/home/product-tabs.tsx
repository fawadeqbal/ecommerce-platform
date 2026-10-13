'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { StorefrontProductCard } from '@ecommerce/types';
import { cn } from '@ecommerce/ui';
import { ProductCard } from '@/components/catalog/product-card';
import { productGrid } from './section-head';

interface Tab {
  key: string;
  label: string;
  href: string;
  products: StorefrontProductCard[];
  ranked?: boolean;
  badge?: 'new';
}

/** One calm "For you" block instead of three look-alike rows: Featured / Best sellers / New. */
export function ProductTabs({ tabs }: { tabs: Tab[] }) {
  const usable = tabs.filter((t) => t.products.length > 0);
  const [active, setActive] = useState(usable[0]?.key);
  const tab = usable.find((t) => t.key === active) ?? usable[0];
  if (!tab) return null;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
            Picked for you
          </p>
          <h2 className="text-[clamp(24px,2.8vw,34px)] font-extrabold tracking-heading text-gray-900">
            Discover more
          </h2>
        </div>
        <Link
          href={tab.href}
          className="group/link inline-flex flex-none items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-700 hover:text-white"
        >
          See all
          <span aria-hidden className="transition-transform group-hover/link:translate-x-0.5">
            →
          </span>
        </Link>
      </div>

      {usable.length > 1 ? (
        <div role="tablist" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {usable.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={t.key === tab.key}
              onClick={() => setActive(t.key)}
              className={cn(
                'flex-none rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
                t.key === tab.key
                  ? 'bg-brand-600 text-white shadow-[0_8px_18px_-8px_rgba(83,43,199,.6)]'
                  : 'bg-white text-gray-600 ring-1 ring-black/[.06] hover:text-brand-700',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      ) : null}

      <div key={tab.key} role="tabpanel" className={cn(productGrid, 'animate-fade-in')}>
        {tab.products.map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            rank={tab.ranked ? i + 1 : undefined}
            badge={tab.badge}
          />
        ))}
      </div>
    </section>
  );
}
