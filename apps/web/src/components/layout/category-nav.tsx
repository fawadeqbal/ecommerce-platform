'use client';

/* eslint-disable @next/next/no-img-element -- category images are served from object storage */
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Portal, cn } from '@ecommerce/ui';
import { GridIcon } from '@/components/icons';
import { container } from './container';

export interface NavItem {
  href: string;
  label: string;
  image?: string | null;
  children?: NavItem[];
}

const SHOW_GRANDCHILDREN = 6;

/**
 * White bar under the header. Categories with sub-categories open a mega menu on hover
 * (or keyboard focus): every sub-category as a column with its own children listed below.
 */
export function CategoryNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const here = search ? `${pathname}?${search}` : pathname;

  const [open, setOpen] = useState<number | null>(null);
  const [top, setTop] = useState(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(null), 140);
  };
  const show = (i: number, el: HTMLElement) => {
    cancelClose();
    if (!items[i]?.children?.length || !window.matchMedia('(min-width: 768px)').matches) {
      setOpen(null);
      return;
    }
    const bar = el.closest('nav') ?? el;
    setTop(bar.getBoundingClientRect().bottom);
    setOpen(i);
  };

  // Close on navigation, scroll and Escape.
  useEffect(() => setOpen(null), [here]);
  useEffect(() => {
    if (open === null) return;
    const close = () => setOpen(null);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('scroll', close, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = open !== null ? items[open] : undefined;

  return (
    <>
      {items.map((item, i) => {
        const active =
          item.href === here || (item.href !== '/' && here.startsWith(`${item.href}/`));
        const hasMenu = Boolean(item.children?.length);
        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            aria-haspopup={hasMenu ? 'true' : undefined}
            aria-expanded={hasMenu ? open === i : undefined}
            onMouseEnter={(e) => show(i, e.currentTarget)}
            onMouseLeave={scheduleClose}
            onFocus={(e) => show(i, e.currentTarget)}
            className={cn(
              'relative flex items-center gap-1.5 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors',
              active || open === i ? 'text-brand-700' : 'text-gray-600 hover:text-brand-600',
            )}
          >
            {i === 0 ? <GridIcon size={16} /> : null}
            {item.label}
            {hasMenu ? (
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden
                className={cn(
                  'hidden h-3.5 w-3.5 opacity-60 transition-transform duration-200 md:block',
                  open === i && 'rotate-180',
                )}
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            ) : null}
            <span
              aria-hidden
              className={cn(
                'absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-brand-600 transition-transform duration-200',
                active || open === i ? 'scale-x-100' : 'scale-x-0',
              )}
            />
          </Link>
        );
      })}

      {current?.children?.length ? (
        <Portal>
          <div
            className="fixed inset-x-0 z-[60] animate-fade-in"
            style={{ top }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className="border-y border-gray-200 bg-white shadow-[0_24px_48px_-12px_rgba(27,24,48,0.18)]">
              <div className={cn(container, 'flex gap-8 py-6')}>
                {/* Category card */}
                <Link
                  href={current.href}
                  className="group relative hidden w-56 flex-none flex-col justify-end overflow-hidden rounded-3xl bg-brand-600 p-5 text-white lg:flex"
                >
                  {current.image ? (
                    <img
                      src={current.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/80"
                    />
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-brand-800/90 via-brand-700/30 to-transparent" />
                  <span className="relative text-xs font-bold uppercase tracking-[0.14em] text-brand-100">
                    Explore
                  </span>
                  <span className="relative text-2xl font-extrabold leading-tight">
                    {current.label}
                  </span>
                  <span className="relative mt-3 inline-flex items-center gap-1 self-start rounded-full bg-white px-3.5 py-1.5 text-sm font-bold text-gray-900 transition-colors group-hover:bg-accent">
                    Shop all <span aria-hidden>→</span>
                  </span>
                </Link>

                {/* Sub-categories as columns */}
                <div className="grid flex-1 grid-cols-[repeat(auto-fill,minmax(180px,1fr))] content-start gap-x-8 gap-y-6">
                  {current.children.map((child) => (
                    <div key={child.href} className="flex min-w-0 flex-col gap-2">
                      <Link
                        href={child.href}
                        className="group flex items-center gap-2.5 font-bold text-gray-900 hover:text-brand-700"
                      >
                        {child.image ? (
                          <img
                            src={child.image}
                            alt=""
                            className="h-9 w-9 flex-none rounded-xl bg-gray-50 object-cover"
                          />
                        ) : (
                          <span
                            aria-hidden
                            className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-brand-50 text-sm font-extrabold text-brand-700"
                          >
                            {child.label.charAt(0)}
                          </span>
                        )}
                        <span className="truncate">{child.label}</span>
                      </Link>
                      {child.children?.length ? (
                        <ul className="flex flex-col gap-1 pl-[46px]">
                          {child.children.slice(0, SHOW_GRANDCHILDREN).map((g) => (
                            <li key={g.href}>
                              <Link
                                href={g.href}
                                className="block truncate text-sm text-gray-500 transition-colors hover:translate-x-0.5 hover:text-brand-700"
                              >
                                {g.label}
                              </Link>
                            </li>
                          ))}
                          {child.children.length > SHOW_GRANDCHILDREN ? (
                            <li>
                              <Link
                                href={child.href}
                                className="text-sm font-semibold text-brand-700 hover:underline"
                              >
                                View all {child.children.length} →
                              </Link>
                            </li>
                          ) : null}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Portal>
      ) : null}
    </>
  );
}
