import * as React from 'react';
import { cn } from '../lib/cn';

export interface NavItem {
  label: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface AppShellProps {
  brand: string;
  nav: NavGroup[];
  activePath?: string;
  /** Render prop so each app can use next/link. */
  renderLink: (item: NavItem, className: string) => React.ReactNode;
  /** Optional bar above the page content (user menu, search…). */
  topBar?: React.ReactNode;
  children: React.ReactNode;
}

/** The nav item whose href is the longest prefix of the current path ("/catalog/categories/new" -> Categories). */
function findActiveHref(nav: NavGroup[], path?: string): string | undefined {
  if (!path) return undefined;
  let best: string | undefined;
  for (const item of nav.flatMap((g) => g.items)) {
    const matches =
      item.href === '/' ? path === '/' : path === item.href || path.startsWith(`${item.href}/`);
    if (matches && (!best || item.href.length > best.length)) best = item.href;
  }
  return best;
}

/** Sidebar layout shared by the admin panel and vendor dashboard. */
export function AppShell({ brand, nav, activePath, renderLink, topBar, children }: AppShellProps) {
  const activeHref = findActiveHref(nav, activePath);
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white md:block">
        <div className="flex h-16 items-center border-b border-gray-200 px-6 text-lg font-bold text-brand-700">
          {brand}
        </div>
        <nav className="space-y-6 overflow-y-auto p-4">
          {nav.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.href}>
                    {renderLink(
                      item,
                      cn(
                        'block rounded-lg px-2 py-1.5 text-sm',
                        item.href === activeHref
                          ? 'bg-brand-50 font-medium text-brand-700'
                          : 'text-gray-700 hover:bg-gray-100',
                      ),
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {topBar}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
