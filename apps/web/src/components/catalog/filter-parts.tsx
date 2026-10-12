import type { ReactNode } from 'react';

/** Collapsible filter group. Opens by default when it has an active choice. */
export function FilterSection({
  title,
  active = 0,
  open,
  children,
}: {
  title: string;
  /** Number of active choices in this group (shown as a badge). */
  active?: number;
  open?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={open ?? active > 0}
      className="group/section border-b border-gray-100 pb-3 last:border-b-0"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-2 text-sm font-bold [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          {title}
          {active > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] text-white">
              {active}
            </span>
          ) : null}
        </span>
        <span
          aria-hidden
          className="text-gray-400 transition-transform group-open/section:rotate-180"
        >
          ▾
        </span>
      </summary>
      <div className="flex flex-col gap-2 pt-1">{children}</div>
    </details>
  );
}

/** Shows the first `visible` items; the rest sit behind "Show N more" (no JavaScript). */
export function ShowMore({
  items,
  visible = 6,
  keepOpen,
}: {
  items: ReactNode[];
  visible?: number;
  /** Open the extra items (e.g. a hidden item is selected). */
  keepOpen?: boolean;
}) {
  if (items.length <= visible + 1) return <>{items}</>;
  return (
    <>
      {items.slice(0, visible)}
      <details open={keepOpen} className="group/more">
        <summary className="cursor-pointer list-none py-1 text-[13px] font-bold text-brand-700 [&::-webkit-details-marker]:hidden">
          <span className="group-open/more:hidden">Show {items.length - visible} more</span>
          <span className="hidden group-open/more:inline">Show less</span>
        </summary>
        <div className="flex flex-col gap-2 pt-1">{items.slice(visible)}</div>
      </details>
    </>
  );
}
