'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { newsletterFormSchema } from '@ecommerce/types';
import { marketingApi } from '@/lib/api-client';
import { toast } from '@/lib/toast';

/** Footer signup band: double opt-in (a confirmation email is sent). */
export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [invalid, setInvalid] = useState<string | null>(null);
  const join = useMutation({
    mutationFn: (value: string) => marketingApi.subscribe(value),
    onSuccess: () =>
      toast.success('Check your inbox', { description: 'Confirm your email to subscribe.' }),
  });
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-brand-600 p-[clamp(20px,3vw,36px)] text-white">
      <div className="flex-[1_1_300px]">
        <h2 className="mb-1 text-[clamp(22px,2.6vw,30px)] font-extrabold tracking-heading text-white">
          Get deals before everyone else
        </h2>
        <p className="text-brand-100">Weekly sale alerts and price drops. Unsubscribe any time.</p>
      </div>
      <div className="min-w-0 max-w-[480px] flex-[1_1_280px]">
        {join.isSuccess ? (
          <p className="rounded-[18px] bg-white/15 px-4 py-3 font-semibold" role="status">
            {join.data.message}
          </p>
        ) : (
          <form
            noValidate
            className="flex gap-2 rounded-[18px] bg-white p-1.5"
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
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-w-0 flex-1 bg-transparent px-3 text-gray-900 placeholder:text-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={join.isPending}
              className="h-11 rounded-[14px] bg-accent px-5 font-bold text-gray-900 hover:bg-accent-strong disabled:opacity-60"
            >
              Subscribe
            </button>
          </form>
        )}
        {invalid || join.error ? (
          <p className="mt-2 text-sm font-medium text-accent-soft">
            {invalid ?? join.error?.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
