'use client';

import { useEffect, useState } from 'react';

const pad = (n: number) => String(n).padStart(2, '0');

/** Time left until midnight (today's deals). Renders nothing until mounted to avoid a hydration mismatch. */
export function DealsCountdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      setLeft(Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000)));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  if (left === null) return null;
  return (
    <div className="flex items-center gap-1.5 rounded-2xl bg-accent px-3 py-1.5 text-xl font-extrabold tabular-nums text-gray-900">
      <span className="mr-1 text-xs font-semibold">Ends in</span>
      {pad(Math.floor(left / 3600))}
      <span className="opacity-50">:</span>
      {pad(Math.floor(left / 60) % 60)}
      <span className="opacity-50">:</span>
      {pad(left % 60)}
    </div>
  );
}
