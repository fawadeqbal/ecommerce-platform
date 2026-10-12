'use client';

import { useEffect } from 'react';

/** Publishes the sticky header's real height as --header-h so sticky panels sit just below it. */
export function HeaderHeight() {
  useEffect(() => {
    const header = document.getElementById('site-header');
    if (!header) return;
    const set = () =>
      document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);
  return null;
}
