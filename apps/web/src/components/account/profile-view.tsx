'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordFormValues,
  type ProfileFormValues,
} from '@ecommerce/types';
import { Alert, Badge, Button, Card, CardTitle, Input, Spinner } from '@ecommerce/ui';
import { useMe } from '@/hooks/use-cart';
import { authApi, queryKeys, usersApi, type CurrentUser } from '@/lib/api-client';

export function ProfileView() {
  const { data: me } = useMe();
  if (!me) return <Spinner />;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <EmailCard me={me} />
      <ProfileForm key={me.id} me={me} />
      <PasswordForm hasPassword={me.hasPassword} />
    </div>
  );
}

function EmailCard({ me }: { me: CurrentUser }) {
  const resend = useMutation({ mutationFn: authApi.resendVerification });
  return (
    <Card className="space-y-3">
      <CardTitle>Email</CardTitle>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium text-gray-900">{me.email}</span>
        {me.emailVerifiedAt ? (
          <Badge tone="green">Verified</Badge>
        ) : (
          <Badge tone="yellow">Not verified</Badge>
        )}
        {me.googleLinked ? <Badge tone="blue">Google connected</Badge> : null}
      </div>
      {!me.emailVerifiedAt ? (
        <div className="space-y-2">
          {resend.isSuccess ? (
            <Alert tone="success">Verification email sent. Check your inbox.</Alert>
          ) : null}
          {resend.error ? <Alert tone="error">{resend.error.message}</Alert> : null}
          <Button
            variant="outline"
            size="sm"
            loading={resend.isPending}
            onClick={() => resend.mutate()}
          >
            Send verification email
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

function ProfileForm({ me }: { me: CurrentUser }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: me.firstName, lastName: me.lastName, phone: me.phone ?? '' },
  });
  const save = useMutation({
    mutationFn: (v: ProfileFormValues) =>
      usersApi.updateProfile({
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        phone: v.phone.trim() || null,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.me, updated);
      reset({
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone ?? '',
      });
    },
  });

  return (
    <Card>
      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4" noValidate>
        <CardTitle>Your details</CardTitle>
        {save.isSuccess && !isDirty ? <Alert tone="success">Saved.</Alert> : null}
        {save.error ? <Alert tone="error">{save.error.message}</Alert> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            autoComplete="given-name"
            {...register('firstName')}
            error={errors.firstName?.message}
          />
          <Input
            label="Last name"
            autoComplete="family-name"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
          <Input
            label="Phone (optional)"
            type="tel"
            autoComplete="tel"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>
        <Button type="submit" loading={save.isPending} disabled={!isDirty}>
          Save details
        </Button>
      </form>
    </Card>
  );
}

function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const queryClient = useQueryClient();
  const empty = { hasPassword, currentPassword: '', newPassword: '', confirm: '' };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: empty,
  });
  const save = useMutation({
    mutationFn: (v: ChangePasswordFormValues) =>
      usersApi.changePassword({
        currentPassword: v.hasPassword ? v.currentPassword : undefined,
        newPassword: v.newPassword,
      }),
    onSuccess: async () => {
      reset({ ...empty, hasPassword: true });
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });

  return (
    <Card>
      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4" noValidate>
        <CardTitle>{hasPassword ? 'Change password' : 'Set a password'}</CardTitle>
        {!hasPassword ? (
          <p className="text-sm text-gray-600">
            You sign in with Google or an email code. Add a password to sign in with it too.
          </p>
        ) : null}
        {save.isSuccess ? (
          <Alert tone="success">Password saved. Other devices were signed out.</Alert>
        ) : null}
        {save.error ? <Alert tone="error">{save.error.message}</Alert> : null}
        <div className="grid gap-4 sm:grid-cols-3">
          {hasPassword ? (
            <Input
              label="Current password"
              type="password"
              autoComplete="current-password"
              {...register('currentPassword')}
              error={errors.currentPassword?.message}
            />
          ) : null}
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            {...register('newPassword')}
            error={errors.newPassword?.message}
          />
          <Input
            label="Repeat new password"
            type="password"
            autoComplete="new-password"
            {...register('confirm')}
            error={errors.confirm?.message}
          />
        </div>
        <Button type="submit" loading={save.isPending}>
          Save password
        </Button>
      </form>
    </Card>
  );
}
