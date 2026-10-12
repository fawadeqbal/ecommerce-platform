'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Portal, cn } from '@ecommerce/ui';
import { dismissToast, subscribeToasts, type ToastItem } from '@/lib/toast';

const ICON = { success: '✓', error: '!', info: 'i' } as const;
const ICON_STYLE = {
  success: 'bg-emerald-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-brand-600 text-white',
} as const;

/** Stack of toasts: bottom-right on desktop, above the tab bar on phones. */
export function Toaster() {
  const [list, setList] = useState<ToastItem[]>([]);
  useEffect(() => subscribeToasts(setList), []);
  return (
    <Portal>
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-24 z-[70] flex flex-col items-center gap-2 md:inset-x-auto md:bottom-6 md:right-6 md:items-end"
      >
        {list.map((t) => (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-sm animate-pop-in items-center gap-3 rounded-2xl bg-gray-900 py-3 pl-3 pr-2 text-sm text-white shadow-card"
          >
            <span
              aria-hidden
              className={cn(
                'flex h-7 w-7 flex-none items-center justify-center rounded-full text-sm font-extrabold',
                ICON_STYLE[t.tone],
              )}
            >
              {ICON[t.tone]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{t.title}</p>
              {t.description ? <p className="text-gray-300">{t.description}</p> : null}
            </div>
            {t.action ? (
              <Link
                href={t.action.href}
                onClick={() => dismissToast(t.id)}
                className="rounded-xl bg-white/10 px-3 py-1.5 font-bold text-accent hover:bg-white/20 hover:text-accent"
              >
                {t.action.label}
              </Link>
            ) : null}
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismissToast(t.id)}
              className="px-2 text-lg leading-none text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </Portal>
  );
}
