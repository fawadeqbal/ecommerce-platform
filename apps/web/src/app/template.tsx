import type { ReactNode } from 'react';

/**
 * Re-mounted on every navigation (unlike layout.tsx), so each screen eases in instead of
 * appearing all at once.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
