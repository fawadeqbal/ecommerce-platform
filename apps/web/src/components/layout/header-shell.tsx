'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@ecommerce/ui';

/**
 * Sticky violet header. Gets a soft shadow once the page scrolls (its size never changes),
 * and publishes its height as --header-h for sticky panels and anchor jumps.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // Shadow only (no size change) and hysteresis, so the state can't flip back and forth
  // while the page settles (that caused flicker on phones).
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled((was) => (was ? y > 4 : y > 24));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
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
        'group/header sticky top-0 z-30 bg-brand-600 text-white transition-shadow duration-300',
        scrolled && 'shadow-[0_10px_30px_-12px_rgba(46,27,114,0.55)]',
      )}
    >
      <div className="relative">{children}</div>
    </header>
  );
}
