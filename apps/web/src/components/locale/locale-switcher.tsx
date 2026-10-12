'use client';

import { useLocale } from './locale-provider';

/** Currency switcher (and language switcher once more than one language is active). */
export function LocaleSwitcher() {
  const { info, currency, setCurrency, language, setLanguage, t } = useLocale();
  if (!info) return null;
  const select =
    'h-9 rounded-[14px] border-0 bg-white/[.14] px-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/40 [&>option]:text-gray-900';
  return (
    <div className="hidden items-center gap-2 lg:flex">
      {info.currencies.length > 1 ? (
        <select
          aria-label={t('locale.currency')}
          className={select}
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {info.currencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>
      ) : null}
      {info.languages.length > 1 ? (
        <select
          aria-label={t('locale.language')}
          className={select}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {info.languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}
