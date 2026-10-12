'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@ecommerce/ui';

export interface ProductTab {
  id: string;
  label: string;
  content: ReactNode;
}

/** Description / specs / reviews / Q&A. `#reviews` and `#questions` links open their tab. */
export function ProductTabs({ tabs }: { tabs: ProductTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (tabs.some((t) => t.id === id)) setActive(id);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [tabs]);
  return (
    <section
      id="details"
      className="flex scroll-mt-28 flex-col gap-5 rounded-3xl bg-white p-[clamp(18px,3vw,32px)]"
    >
      <div
        role="tablist"
        className="scrollbar-none flex max-w-full gap-1 self-start overflow-x-auto rounded-2xl bg-gray-50 p-1"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={t.id === active}
            aria-controls={`panel-${t.id}`}
            onClick={() => setActive(t.id)}
            className={cn(
              'whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold',
              t.id === active
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          id={`panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${t.id}`}
          hidden={t.id !== active}
        >
          {t.content}
        </div>
      ))}
    </section>
  );
}
