'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@ecommerce/ui';

/**
 * Sticky violet header. Gets a soft shadow and a slightly slimmer bar once the page scrolls,
 * and publishes its height as --header-h for sticky panels and anchor jumps.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () =>
      document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <header
      id="site-header"
      ref={ref}
      data-scrolled={scrolled}
      className={cn(
        'group/header sticky top-0 z-30 bg-gradient-to-r from-brand-600 via-brand-600 to-brand-700 text-white transition-shadow duration-300',
        scrolled && 'shadow-[0_10px_30px_-12px_rgba(46,27,114,0.55)]',
      )}
    >
      {/* soft light spots */}
      <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute -left-20 -top-24 h-56 w-56 rounded-full bg-white/[.07] blur-2xl" />
        <span className="absolute -top-16 right-1/4 h-40 w-40 rounded-full bg-accent/[.12] blur-2xl" />
      </span>
      <div className="relative">{children}</div>
    </header>
  );
}
