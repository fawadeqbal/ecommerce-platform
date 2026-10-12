'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@ecommerce/ui';
import { GridIcon } from '@/components/icons';

/** White bar under the header: menu links with the current one highlighted. */
export function CategoryNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const here = search ? `${pathname}?${search}` : pathname;
  return (
    <>
      {items.map((item, i) => {
        const active =
          item.href === here || (item.href !== '/' && here.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex items-center gap-1.5 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors',
              active ? 'text-brand-700' : 'text-gray-600 hover:text-brand-600',
            )}
          >
            {i === 0 ? <GridIcon size={16} /> : null}
            {item.label}
            <span
              aria-hidden
              className={cn(
                'absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-brand-600 transition-transform duration-200',
                active ? 'scale-x-100' : 'scale-x-0',
              )}
            />
          </Link>
        );
      })}
    </>
  );
}
