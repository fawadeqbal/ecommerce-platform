'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@ecommerce/ui';

/**
 * Filter sidebar. The form is a plain GET form (works without JavaScript); with JavaScript it
 * re-submits on every change. On phones it opens from the "Filters" button.
 */
export function FilterPanel({
  activeCount,
  total,
  resetHref,
  children,
}: {
  activeCount: number;
  total: number;
  resetHref: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const submit = () => form.requestSubmit();
    form.addEventListener('change', submit);
    return () => form.removeEventListener('change', submit);
  }, []);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="self-start rounded-xl bg-gray-900 px-3.5 py-[9px] text-sm font-bold text-white lg:hidden"
      >
        Filters · {activeCount}
      </button>
      <aside
        className={cn(
          'flex-col gap-[22px] rounded-3xl bg-white p-5 lg:sticky lg:top-24 lg:flex',
          open ? 'flex' : 'hidden',
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-lg font-extrabold">Filters</span>
          <a href={resetHref} className="text-sm font-semibold text-brand-700 hover:text-brand-900">
            Reset
          </a>
        </div>
        <form ref={formRef} method="get" className="flex flex-col gap-[22px]">
          {children}
          <noscript>
            <button
              type="submit"
              className="h-12 w-full rounded-2xl bg-brand-600 font-bold text-white"
            >
              Apply
            </button>
          </noscript>
        </form>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-12 rounded-2xl bg-brand-600 font-bold text-white lg:hidden"
        >
          Show {total.toLocaleString()} results
        </button>
      </aside>
    </>
  );
}
