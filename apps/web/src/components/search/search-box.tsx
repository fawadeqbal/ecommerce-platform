'use client';

/* eslint-disable @next/next/no-img-element -- images are served from object storage */
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { formatMoney } from '@ecommerce/ui';
import { useLocale } from '@/components/locale/locale-provider';
import { queryKeys, searchApi } from '@/lib/api-client';

/** Header search with typo-tolerant suggestions (products, categories, brands). */
export function SearchBox() {
  const router = useRouter();
  const params = useSearchParams();
  const listId = useId();
  const [value, setValue] = useState(params.get('q') ?? '');
  const [debounced, setDebounced] = useState(value);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const { t } = useLocale();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value.trim()), 200);
    return () => clearTimeout(t);
  }, [value]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const { data } = useQuery({
    queryKey: queryKeys.searchSuggest(debounced),
    queryFn: () => searchApi.suggest(debounced),
    enabled: debounced.length >= 2,
    staleTime: 60_000,
  });
  const hasResults =
    !!data && (data.products.length > 0 || data.categories.length > 0 || data.brands.length > 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div ref={boxRef} className="relative order-3 min-w-0 flex-[1_1_400px]">
      <form
        action="/search"
        onSubmit={submit}
        role="search"
        className="flex h-12 items-center gap-2 rounded-2xl bg-white pl-[18px] pr-1.5"
      >
        <input
          name="q"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          placeholder={t('header.searchPlaceholder')}
          aria-label="Search products"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open && hasResults}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-gray-900 placeholder:text-gray-500 focus:outline-none"
        />
        <button
          type="submit"
          className="h-9 rounded-xl bg-accent px-[18px] font-bold text-gray-900 hover:bg-accent-strong"
        >
          {t('header.search')}
        </button>
      </form>
      {open && hasResults ? (
        <div
          id={listId}
          className="absolute left-0 right-0 top-[52px] z-40 rounded-2xl border border-gray-200 bg-white p-2 text-sm text-gray-900 shadow-card"
        >
          {data.products.map((p) => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-gray-50"
            >
              <span className="h-9 w-9 shrink-0 overflow-hidden rounded border border-gray-100 bg-gray-50">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt="" className="h-full w-full object-contain" />
                ) : null}
              </span>
              <span className="flex-1 truncate text-gray-900">{p.name}</span>
              <span className="text-gray-500">{formatMoney(p.price, p.currency)}</span>
            </Link>
          ))}
          {data.categories.length + data.brands.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-2 border-t border-gray-100 px-2 pt-2">
              {data.categories.map((c) => (
                <Link
                  key={`c-${c.slug}`}
                  href={`/categories/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700 hover:bg-gray-200"
                >
                  {c.name}
                </Link>
              ))}
              {data.brands.map((b) => (
                <Link
                  key={`b-${b.slug}`}
                  href={`/brands/${b.slug}`}
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-800 hover:bg-brand-100"
                >
                  {b.name}
                </Link>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={submit}
            className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-brand-700 hover:bg-gray-50"
          >
            See all results for “{value.trim()}”
          </button>
        </div>
      ) : null}
    </div>
  );
}
