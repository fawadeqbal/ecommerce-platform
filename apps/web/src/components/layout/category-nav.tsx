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
  /** 'all' = the "All categories" browser (vertical list + hovered category's tree). */
  kind?: 'all';
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

  // `open` = highlighted link, `shown` = panel content kept mounted while it fades out.
  const [open, setOpenState] = useState<number | null>(null);
  const [shown, setShown] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [top, setTop] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibleRef = useRef(false);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
  };
  const setOpen = (i: number | null) => {
    clear();
    setOpenState(i);
    if (i === null) {
      visibleRef.current = false;
      setVisible(false);
      timer.current = setTimeout(() => setShown(null), 220); // let it fade out
      return;
    }
    setShown(i);
    visibleRef.current = true;
    requestAnimationFrame(() => setVisible(true));
  };
  const cancelClose = clear;
  const scheduleClose = () => {
    clear();
    timer.current = setTimeout(() => setOpen(null), 160);
  };
  const show = (i: number, el: HTMLElement) => {
    clear();
    if (!items[i]?.children?.length || !window.matchMedia('(min-width: 768px)').matches) {
      if (visibleRef.current) scheduleClose();
      return;
    }
    const bar = el.closest('nav') ?? el;
    setTop(bar.getBoundingClientRect().bottom);
    // Already open: switch at once. Closed: wait a beat so passing the mouse over doesn't flash it.
    if (visibleRef.current) setOpen(i);
    else timer.current = setTimeout(() => setOpen(i), 90);
  };

  // Close on navigation, scroll and Escape.
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const current = shown !== null ? items[shown] : undefined;

  return (
    <>
      <style>
        {'.menu-in{animation:menu-in .32s cubic-bezier(.22,1,.36,1) backwards}' +
          '@keyframes menu-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}' +
          '@media (prefers-reduced-motion:reduce){.menu-in{animation:none}}'}
      </style>
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

      {current?.kind === 'all' && current.children?.length ? (
        <Portal>
          <div
            className={cn(
              'fixed inset-x-0 z-[60] origin-top transition-[opacity,transform] duration-200 ease-out',
              visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0',
            )}
            style={{ top }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <AllCategoriesPanel item={current} />
          </div>
        </Portal>
      ) : current?.children?.length ? (
        <Portal>
          <div
            className={cn(
              'fixed inset-x-0 z-[60] origin-top transition-[opacity,transform] duration-200 ease-out',
              visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0',
            )}
            style={{ top }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className="border-y border-gray-200 bg-white shadow-[0_24px_48px_-12px_rgba(27,24,48,0.18)]">
              <div key={current.href} className={cn(container, 'menu-in flex gap-8 py-6')}>
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
                  {current.children.map((child, k) => (
                    <div
                      key={child.href}
                      className="menu-in flex min-w-0 flex-col gap-2"
                      style={{ animationDelay: `${40 + k * 35}ms` }}
                    >
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

/** Amazon-style browser: top-level categories on the left, the hovered one's tree on the right. */
function AllCategoriesPanel({ item }: { item: NavItem }) {
  const roots = item.children ?? [];
  const [hover, setHover] = useState(0);
  const root = roots[hover] ?? roots[0];
  if (!root) return null;
  const kids = root.children ?? [];

  return (
    <div className="border-y border-gray-200 bg-white shadow-[0_24px_48px_-12px_rgba(27,24,48,0.18)]">
      <div className={cn(container, 'flex max-h-[min(70vh,560px)] gap-0 py-0')}>
        {/* Top-level list */}
        <ul className="scrollbar-none w-64 flex-none overflow-y-auto border-r border-gray-100 py-3 pr-3">
          {roots.map((r, i) => (
            <li key={r.href}>
              <Link
                href={r.href}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                  i === hover ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50',
                )}
              >
                {r.image ? (
                  <img src={r.image} alt="" className="h-8 w-8 flex-none rounded-lg object-cover" />
                ) : (
                  <span
                    aria-hidden
                    className={cn(
                      'flex h-8 w-8 flex-none items-center justify-center rounded-lg text-xs font-extrabold',
                      i === hover ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500',
                    )}
                  >
                    {r.label.charAt(0)}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate">{r.label}</span>
                {r.children?.length ? (
                  <span aria-hidden className={cn('text-xs', i === hover ? 'text-brand-600' : 'text-gray-300')}>
                    ›
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>

        {/* Hovered category */}
        <div key={root.href} className="menu-in min-w-0 flex-1 overflow-y-auto py-5 pl-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-xl font-extrabold tracking-heading text-gray-900">{root.label}</h3>
            <Link
              href={root.href}
              className="flex-none rounded-full bg-gray-900 px-3.5 py-1.5 text-sm font-bold text-white hover:bg-brand-700"
            >
              Shop all →
            </Link>
          </div>
          {kids.length === 0 ? (
            <Link
              href={root.href}
              className="flex items-center gap-4 rounded-3xl bg-brand-50 p-5 text-brand-800 hover:bg-brand-100"
            >
              <span className="text-3xl" aria-hidden>
                🛍️
              </span>
              <span>
                <b className="block">Browse every product in {root.label}</b>
                <span className="text-sm text-brand-700/80">Filters, deals and new arrivals inside.</span>
              </span>
            </Link>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-x-8 gap-y-6">
              {kids.map((child, k) => (
                <div
                  key={child.href}
                  className="menu-in flex min-w-0 flex-col gap-1.5"
                  style={{ animationDelay: `${30 + k * 30}ms` }}
                >
                  <Link
                    href={child.href}
                    className="truncate font-bold text-gray-900 hover:text-brand-700"
                  >
                    {child.label}
                  </Link>
                  {child.children?.slice(0, SHOW_GRANDCHILDREN).map((g) => (
                    <Link
                      key={g.href}
                      href={g.href}
                      className="truncate text-sm text-gray-500 transition-colors hover:text-brand-700"
                    >
                      {g.label}
                    </Link>
                  ))}
                  {(child.children?.length ?? 0) > SHOW_GRANDCHILDREN ? (
                    <Link href={child.href} className="text-sm font-semibold text-brand-700 hover:underline">
                      View all →
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
