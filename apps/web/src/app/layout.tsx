import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { OrganizationJsonLd } from '@/components/seo/organization-json-ld';
import { MaintenanceGate } from '@/components/layout/maintenance-gate';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Ecommerce', template: '%s | Ecommerce' },
  description: 'Shop thousands of products from trusted sellers.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <MaintenanceGate>
          <Providers>
            <OrganizationJsonLd />
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </Providers>
        </MaintenanceGate>
      </body>
    </html>
  );
}
