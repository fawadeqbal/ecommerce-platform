'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppShell } from '@ecommerce/ui';
import { navigation } from '@/config/navigation';

export function SidebarShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AppShell
      brand="Admin"
      nav={navigation}
      activePath={pathname}
      renderLink={(item, className) => (
        <Link href={item.href} className={className}>
          {item.label}
        </Link>
      )}
    >
      {children}
    </AppShell>
  );
}
