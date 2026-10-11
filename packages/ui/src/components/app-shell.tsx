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
  children: React.ReactNode;
}

/** Sidebar layout shared by the admin panel and vendor dashboard. */
export function AppShell({ brand, nav, activePath, renderLink, children }: AppShellProps) {
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
                {group.items.map((item) => {
                  const active = activePath === item.href;
                  return (
                    <li key={item.href}>
                      {renderLink(
                        item,
                        cn(
                          'block rounded-lg px-2 py-1.5 text-sm',
                          active
                            ? 'bg-brand-50 font-medium text-brand-700'
                            : 'text-gray-700 hover:bg-gray-100',
                        ),
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
