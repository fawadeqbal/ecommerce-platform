'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Portal, cn } from '@ecommerce/ui';

/**
 * Filter sidebar. The form is a plain GET form (works without JavaScript); with JavaScript it
 * re-submits on every change. Desktop: a normal column that scrolls with the page.
 * Phones: a "Filters" button opens it as a bottom sheet.
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
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="flex items-center gap-2 self-start rounded-xl bg-gray-900 px-3.5 py-[9px] text-sm font-bold text-white lg:hidden"
      >
        Filters
        {activeCount > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] text-gray-900">
            {activeCount}
          </span>
        ) : null}
      </button>
      {open ? (
        <Portal>
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 animate-fade-in bg-gray-900/40 backdrop-blur-sm lg:hidden"
          />
        </Portal>
      ) : null}
      <aside
        aria-label="Filters"
        className={cn(
          'flex-col rounded-3xl bg-white',
          // desktop: part of the page (no inner scrolling)
          'lg:flex',
          // phones: bottom sheet
          open
            ? 'fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] animate-sheet-up rounded-b-none shadow-card lg:animate-none'
            : 'hidden',
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-5 py-4">
          <span className="text-lg font-extrabold">Filters</span>
          <div className="flex items-center gap-3">
            {activeCount > 0 ? (
              <a href={resetHref} className="text-sm font-semibold text-brand-700">
                Clear all
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close filters"
              className="text-xl text-gray-500 lg:hidden"
            >
              ×
            </button>
          </div>
        </div>
        <form
          ref={formRef}
          method="get"
          className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-5 py-2 lg:overflow-visible"
        >
          {children}
          <noscript>
            <button
              type="submit"
              className="mt-2 h-11 w-full rounded-2xl bg-brand-600 font-bold text-white"
            >
              Apply
            </button>
          </noscript>
        </form>
        <div className="border-t border-gray-100 p-4 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-12 w-full rounded-2xl bg-brand-600 font-bold text-white"
          >
            Show {total.toLocaleString()} results
          </button>
        </div>
      </aside>
    </>
  );
}
