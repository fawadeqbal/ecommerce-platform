'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  addressFormSchema,
  addressFormToInput,
  addressToForm,
  emptyAddressForm,
  formatAddress,
  type AddressDto,
  type AddressFormValues,
} from '@ecommerce/types';
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  ConfirmDialog,
  EmptyState,
  Input,
  Modal,
  Spinner,
} from '@ecommerce/ui';
import { addressesApi, queryKeys } from '@/lib/api-client';
import { AddressInputs } from './address-inputs';

export function AddressesView() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.addresses,
    queryFn: addressesApi.list,
  });
  const [editing, setEditing] = useState<AddressDto | 'new' | null>(null);
  const [deleting, setDeleting] = useState<AddressDto | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: emptyAddressForm,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses });

  const save = useMutation({
    mutationFn: (values: AddressFormValues) => {
      const input = addressFormToInput(values);
      return editing && editing !== 'new'
        ? addressesApi.update(editing.id, input)
        : addressesApi.create(input);
    },
    onSuccess: async () => {
      await refresh();
      setEditing(null);
    },
  });

  const makeDefault = useMutation({
    mutationFn: (id: string) => addressesApi.update(id, { isDefault: true }),
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: (id: string) => addressesApi.remove(id),
    onSuccess: async () => {
      await refresh();
      setDeleting(null);
    },
  });

  const open = (target: AddressDto | 'new') => {
    save.reset();
    reset(
      target === 'new'
        ? { ...emptyAddressForm, isDefault: (data?.length ?? 0) === 0 }
        : addressToForm(target),
    );
    setEditing(target);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Addresses</h1>
        <Button onClick={() => open('new')}>Add address</Button>
      </div>

      {error ? (
        <Alert tone="error" title="Could not load addresses">
          {error.message}
        </Alert>
      ) : null}
      {makeDefault.error ? <Alert tone="error">{makeDefault.error.message}</Alert> : null}
      {isLoading ? <Spinner /> : null}

      {data && data.length === 0 ? (
        <Card>
          <EmptyState
            title="No saved addresses"
            description="Save an address here or at checkout to reuse it next time."
          />
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {data?.map((a) => (
          <Card key={a.id} className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{a.fullName}</span>
              {a.label ? <Badge>{a.label}</Badge> : null}
              {a.isDefault ? <Badge tone="blue">Default</Badge> : null}
            </div>
            <p className="text-gray-600">{formatAddress(a)}</p>
            <p className="text-gray-500">{a.phone}</p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                className="text-brand-700 hover:underline"
                onClick={() => open(a)}
              >
                Edit
              </button>
              {!a.isDefault ? (
                <button
                  type="button"
                  className="text-gray-700 hover:underline"
                  disabled={makeDefault.isPending}
                  onClick={() => makeDefault.mutate(a.id)}
                >
                  Set as default
                </button>
              ) : null}
              <button
                type="button"
                className="text-red-600 hover:underline"
                onClick={() => {
                  remove.reset();
                  setDeleting(a);
                }}
              >
                Delete
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={editing !== null}
        size="lg"
        title={editing === 'new' ? 'New address' : 'Edit address'}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="address-form" loading={save.isPending}>
              Save address
            </Button>
          </>
        }
      >
        <form
          id="address-form"
          className="space-y-4"
          noValidate
          onSubmit={handleSubmit((values) => save.mutate(values))}
        >
          {save.error ? <Alert tone="error">{save.error.message}</Alert> : null}
          <Input
            label="Label (optional)"
            placeholder="Home, Office…"
            {...register('label')}
            error={errors.label?.message}
          />
          <AddressInputs
            fieldProps={(name) => ({ ...register(name), error: errors[name]?.message })}
          />
          <Checkbox label="Use as my default address" {...register('isDefault')} />
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this address?"
        description={deleting ? formatAddress(deleting) : undefined}
        confirmLabel="Delete"
        loading={remove.isPending}
        error={remove.error?.message}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
