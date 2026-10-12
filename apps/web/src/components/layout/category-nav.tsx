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

/** Tinted initial tiles for the category rail. */
const HUES = [
  'bg-[#eee9fe] text-[#5b3fd9]',
  'bg-[#fff4cc] text-[#9a6b00]',
  'bg-[#e6f6ee] text-[#13804b]',
  'bg-[#fdebef] text-[#c2304a]',
  'bg-[#e6f1fd] text-[#1f5fb8]',
];

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
      {(() => {
        const renderLink = (item: NavItem, i: number) => {
          const active =
            item.href === here || (item.href !== '/' && here.startsWith(`${item.href}/`));
          const hasMenu = Boolean(item.children?.length);
          const isAll = item.kind === 'all';
          const on = active || open === i;
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
                'relative flex h-14 flex-none items-center whitespace-nowrap text-[15px] transition-colors hover:text-brand-600',
                isAll ? 'gap-[9px] px-1 font-semibold' : 'gap-[5px] px-3',
                on ? 'font-semibold text-brand-600' : isAll ? 'text-gray-900' : 'font-medium text-[#3d3955]',
              )}
            >
              {isAll ? <GridIcon size={18} /> : null}
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
                  'absolute bottom-0 h-[3px] rounded-t-[3px] bg-brand-600 transition-opacity duration-150',
                  isAll ? 'inset-x-0' : 'inset-x-3',
                  on ? 'opacity-100' : 'opacity-0',
                )}
              />
            </Link>
          );
        };
        const allIndex = items.findIndex((x) => x.kind === 'all');
        return (
          <>
            {allIndex >= 0 ? (
              <>
                {renderLink(items[allIndex]!, allIndex)}
                <span aria-hidden className="mx-2 h-6 w-px flex-none bg-[#eceaf3]" />
              </>
            ) : null}
            <div className="scrollbar-none flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
              {items.map((item, i) => (i === allIndex ? null : renderLink(item, i)))}
            </div>
          </>
        );
      })()}

      {current?.kind === 'all' && current.children?.length ? (
        <Portal>
          <div
            aria-hidden
            onClick={() => setOpen(null)}
            className={cn(
              'fixed inset-x-0 bottom-0 z-[59] bg-[rgba(30,26,51,.28)] transition-opacity duration-300',
              visible ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
            style={{ top }}
          />
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
            aria-hidden
            onClick={() => setOpen(null)}
            className={cn(
              'fixed inset-x-0 bottom-0 z-[59] bg-[rgba(30,26,51,.28)] transition-opacity duration-300',
              visible ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
            style={{ top }}
          />
          <div
            className={cn(
              'fixed inset-x-0 z-[60] origin-top transition-[opacity,transform] duration-200 ease-out',
              visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0',
            )}
            style={{ top }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className={container}>
              <div
                key={current.href}
                className="menu-in mt-2.5 flex gap-8 overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_0_0_1px_rgba(30,26,51,.05),0_30px_70px_-16px_rgba(30,26,51,.35)]"
              >
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
    <div className={container}>
      <div className="mt-2.5 flex max-h-[min(72vh,580px)] overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(30,26,51,.05),0_30px_70px_-16px_rgba(30,26,51,.35)]">
        {/* Top-level list */}
        <ul className="scrollbar-none flex w-60 flex-none flex-col gap-0.5 overflow-y-auto border-r border-[#efedf5] bg-[#f8f7fc] p-3 xl:w-[290px]">
          <li className="px-3 pb-2.5 pt-2 text-[11.5px] font-bold tracking-[1px] text-[#9894ae]">
            BROWSE CATEGORIES
          </li>
          {roots.map((r, i) => (
            <li key={r.href}>
              <Link
                href={r.href}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-2.5 py-2 text-[15px] transition-all duration-150 hover:text-brand-600',
                  i === hover
                    ? 'bg-white font-semibold text-brand-600 shadow-[0_1px_2px_rgba(30,26,51,.06),0_4px_12px_-4px_rgba(30,26,51,.1)]'
                    : 'font-medium text-[#3d3955]',
                )}
              >
                {r.image ? (
                  <img src={r.image} alt="" className="h-9 w-9 flex-none rounded-[11px] object-cover" />
                ) : (
                  <span
                    aria-hidden
                    className={cn(
                      'flex h-9 w-9 flex-none items-center justify-center rounded-[11px] text-sm font-extrabold',
                      HUES[i % HUES.length],
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
        <div key={root.href} className="menu-in min-w-0 flex-1 overflow-y-auto px-7 pb-7 pt-[26px]">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-[#efedf5] pb-[18px]">
            <div className="flex min-w-0 items-baseline gap-3">
              <h3 className="truncate text-2xl font-extrabold tracking-[-0.5px] text-gray-900">{root.label}</h3>
              {kids.length > 0 ? (
                <span className="whitespace-nowrap text-sm text-[#8c88a3]">
                  {kids.length} sub-categories
                </span>
              ) : null}
            </div>
            <Link
              href={root.href}
              className="flex h-[38px] flex-none items-center gap-2 rounded-[11px] bg-gray-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-600 hover:text-white"
            >
              Shop all <span aria-hidden>→</span>
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
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-7 gap-y-6 pt-[22px]">
              {kids.map((child, k) => (
                <div
                  key={child.href}
                  className="menu-in flex min-w-0 flex-col gap-2.5"
                  style={{ animationDelay: `${30 + k * 30}ms` }}
                >
                  <Link
                    href={child.href}
                    className="truncate text-[15px] font-bold text-gray-900 hover:text-brand-600"
                  >
                    {child.label}
                  </Link>
                  {child.children?.slice(0, SHOW_GRANDCHILDREN).map((g) => (
                    <Link
                      key={g.href}
                      href={g.href}
                      className="truncate text-[14.5px] text-[#6e6a85] transition-colors hover:text-brand-600"
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

        {/* Promo card (wide screens) */}
        <Link
          href={root.href}
          className="relative m-6 ml-0 hidden w-[260px] flex-none flex-col overflow-hidden rounded-2xl bg-[radial-gradient(240px_160px_at_90%_0%,rgba(255,255,255,.18),transparent_70%),linear-gradient(160deg,#6447e6,#3b2390)] p-5 text-white hover:text-white xl:flex"
        >
          <span className="text-[11.5px] font-bold tracking-[1.2px] text-accent">THIS WEEK</span>
          <span className="mt-1.5 text-2xl font-extrabold leading-[1.1] tracking-[-0.5px]">
            Best of {root.label}
          </span>
          <span className="my-4 grid min-h-[110px] flex-1 place-items-center overflow-hidden rounded-xl bg-white/[.08] shadow-[inset_0_0_0_1px_rgba(255,255,255,.15)]">
            {root.image ? (
              <img src={root.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <span aria-hidden className="text-5xl">
                🛍️
              </span>
            )}
          </span>
          <span className="flex h-9 items-center gap-1.5 self-start rounded-[10px] bg-accent px-3.5 text-sm font-bold text-gray-900">
            Shop the deal <span aria-hidden>→</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
