import type { Metadata } from 'next';
import { PagePlaceholder } from '@ecommerce/ui';

export const metadata: Metadata = { title: 'Sign in' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Sign in"
      features={['Email + password', 'Email OTP login', 'Google sign-in']}
    />
  );
}
