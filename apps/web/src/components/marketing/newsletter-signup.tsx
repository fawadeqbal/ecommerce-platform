'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { newsletterFormSchema } from '@ecommerce/types';
import { marketingApi } from '@/lib/api-client';

/** Footer signup: double opt-in (a confirmation email is sent). */
export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [invalid, setInvalid] = useState<string | null>(null);
  const join = useMutation({ mutationFn: (value: string) => marketingApi.subscribe(value) });
  return (
    <div className="md:order-last">
      <p className="mb-3 text-sm font-semibold">Newsletter</p>
      <p className="mb-3 text-sm text-gray-600">Offers and new arrivals, about twice a month.</p>
      {join.isSuccess ? (
        <p className="text-sm text-green-700" role="status">
          {join.data.message}
        </p>
      ) : (
        <form
          noValidate
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const parsed = newsletterFormSchema.safeParse({ email });
            if (!parsed.success)
              return setInvalid(parsed.error.issues[0]?.message ?? 'Enter a valid email');
            setInvalid(null);
            join.mutate(parsed.data.email);
          }}
        >
          <input
            type="email"
            aria-label="Email address"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 min-w-0 flex-1 rounded-lg border border-gray-300 px-3 text-sm focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={join.isPending}
            className="h-10 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            Subscribe
          </button>
        </form>
      )}
      {invalid || join.error ? (
        <p className="mt-2 text-sm text-red-600">{invalid ?? join.error?.message}</p>
      ) : null}
    </div>
  );
}
