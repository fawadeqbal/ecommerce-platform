import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card } from '@ecommerce/ui';

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle ? (
          <p className="mb-6 mt-1 text-sm text-gray-500">{subtitle}</p>
        ) : (
          <div className="mb-6" />
        )}
        {children}
      </Card>
      {footer ? <p className="mt-6 text-center text-sm text-gray-600">{footer}</p> : null}
      <p className="mt-2 text-center text-xs text-gray-400">
        <Link href="/">Back to the store</Link>
      </p>
    </div>
  );
}
