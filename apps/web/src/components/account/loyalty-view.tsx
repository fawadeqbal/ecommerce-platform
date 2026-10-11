'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { POINTS_TYPE_LABELS } from '@ecommerce/types';
import { Alert, Button, Card, CardTitle, Spinner, formatDate, formatMoney } from '@ecommerce/ui';
import { loyaltyApi, queryKeys } from '@/lib/api-client';

export function LoyaltyView() {
  const { data: s, error } = useQuery({
    queryKey: queryKeys.loyalty.summary,
    queryFn: loyaltyApi.summary,
  });
  const [copied, setCopied] = useState(false);
  if (error) return <Alert tone="error">{error.message}</Alert>;
  if (!s) return <Spinner />;
  const copy = async () => {
    await navigator.clipboard?.writeText(s.referralUrl).catch(() => undefined);
    setCopied(true);
  };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My points</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-gray-500">Balance</p>
          <p className="text-3xl font-bold text-gray-900">{s.points}</p>
          <p className="text-sm text-gray-600">worth {formatMoney(s.value, s.currency)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Tier</p>
          <p className="text-2xl font-bold text-gray-900">{s.tier?.name ?? '—'}</p>
          <p className="text-sm text-gray-600">
            {s.tier && s.tier.multiplier !== 1 ? `${s.tier.multiplier}× points on purchases. ` : ''}
            {s.nextTier ? `${s.nextTier.pointsNeeded} points to ${s.nextTier.name}` : 'Top tier'}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Invite friends</p>
          <p className="text-sm text-gray-700">
            You both get {s.rules.referralPoints} points after their first order.
          </p>
          <Button size="sm" variant="outline" className="mt-2" onClick={copy}>
            {copied ? 'Link copied' : 'Copy my link'}
          </Button>
          <p className="mt-1 break-all text-xs text-gray-400">{s.referralUrl}</p>
        </Card>
      </div>
      <Card className="text-sm text-gray-700">
        <CardTitle className="mb-2">How it works</CardTitle>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Earn {s.rules.pointsPerCurrencyUnit} point per {formatMoney(1, s.currency)} paid, once
            your order is delivered.
          </li>
          <li>
            {s.rules.signupBonus} points for joining, {s.rules.reviewPoints} for each product
            review.
          </li>
          <li>
            Each point is worth {formatMoney(s.rules.pointValue, s.currency)}; use them at checkout
            for up to {s.rules.maxRedeemPercent}% of an order.
          </li>
          <li>Points expire {s.rules.expiryDays} days after you earn them.</li>
        </ul>
      </Card>
      <Card className="p-0">
        <div className="border-b border-gray-100 px-5 py-3 font-semibold text-gray-900">
          History
        </div>
        {s.history.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-500">No points yet.</p>
        ) : null}
        <ul className="divide-y divide-gray-100 text-sm">
          {s.history.map((t) => (
            <li key={t.id} className="flex items-center justify-between px-5 py-2.5">
              <div>
                <p className="text-gray-900">{t.description ?? POINTS_TYPE_LABELS[t.type]}</p>
                <p className="text-xs text-gray-500">
                  {POINTS_TYPE_LABELS[t.type]} · {formatDate(t.createdAt)}
                  {t.type === 'EARN' && t.expiresAt ? ` · expires ${formatDate(t.expiresAt)}` : ''}
                </p>
              </div>
              <span
                className={
                  t.points >= 0 ? 'font-semibold text-green-700' : 'font-semibold text-gray-700'
                }
              >
                {t.points >= 0 ? '+' : ''}
                {t.points}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
