'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_PAGE_BLOCKS,
  MAX_UPLOAD_MB,
  PAGE_BLOCK_LABELS,
  PAGE_BLOCK_TYPES,
  emptyBlockRow,
  emptyPageForm,
  pageFormSchema,
  pageFormToInput,
  pageToForm,
  slugify,
  type PageDto,
  type PageFormValues,
} from '@ecommerce/types';
import {
  Alert,
  Button,
  Card,
  CardTitle,
  ImageUploadField,
  Input,
  PageHeader,
  Select,
  Textarea,
  buttonStyles,
} from '@ecommerce/ui';
import { cmsApi, mediaApi, queryKeys } from '@/lib/api-client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export function CmsPageForm({ page }: { page?: PageDto }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: page ? pageToForm(page) : emptyPageForm,
  });
  const { fields, append, remove, move } = useFieldArray({ control, name: 'blocks' });

  const save = useMutation({
    mutationFn: (values: PageFormValues) => {
      const input = pageFormToInput(values);
      return page ? cmsApi.updatePage(page.id, input) : cmsApi.createPage(input);
    },
    onSuccess: async (saved) => {
      queryClient.setQueryData(queryKeys.cms.page(saved.id), saved);
      await queryClient.invalidateQueries({ queryKey: queryKeys.cms.pages });
      router.push('/cms/pages');
    },
  });

  const blocks = watch('blocks');
  const title = watch('title');
  const slug = watch('slug');

  return (
    <form
      onSubmit={handleSubmit((v) => save.mutate(v))}
      noValidate
      className="mx-auto max-w-6xl p-6"
    >
      <PageHeader
        breadcrumb={
          <Link href="/cms/pages" className="hover:text-gray-700">
            ← Pages
          </Link>
        }
        title={page ? `Edit “${page.title}”` : 'New page'}
        actions={
          <>
            {page?.status === 'PUBLISHED' ? (
              <a
                href={`${SITE_URL}/pages/${page.slug}`}
                target="_blank"
                rel="noreferrer"
                className={buttonStyles({ variant: 'ghost' })}
              >
                View on site ↗
              </a>
            ) : null}
            <Link href="/cms/pages" className={buttonStyles({ variant: 'outline' })}>
              Cancel
            </Link>
            <Button
              type="submit"
              loading={save.isPending}
              disabled={page !== undefined && !isDirty}
            >
              {page ? 'Save changes' : 'Create page'}
            </Button>
          </>
        }
      />

      {save.error ? (
        <Alert tone="error" title="Could not save the page" className="mb-4">
          {save.error.message}
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <Card>
            <Input label="Title" {...register('title')} error={errors.title?.message} />
          </Card>

          {fields.map((field, index) => {
            const type = blocks[index]?.type ?? 'paragraph';
            const rowErrors = errors.blocks?.[index];
            return (
              <Card key={field.id} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="w-44">
                    <Select
                      aria-label="Block type"
                      options={PAGE_BLOCK_TYPES.map((t) => ({
                        value: t,
                        label: PAGE_BLOCK_LABELS[t],
                      }))}
                      {...register(`blocks.${index}.type`)}
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={index === fields.length - 1}
                      onClick={() => move(index, index + 1)}
                    >
                      ↓
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                      Remove
                    </Button>
                  </div>
                </div>

                {type === 'heading' ? (
                  <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                    <Input
                      label="Heading"
                      {...register(`blocks.${index}.text`)}
                      error={rowErrors?.text?.message}
                    />
                    <Select
                      label="Size"
                      options={[
                        { value: '2', label: 'Large' },
                        { value: '3', label: 'Small' },
                      ]}
                      {...register(`blocks.${index}.level`)}
                    />
                  </div>
                ) : null}

                {type === 'paragraph' ? (
                  <Textarea
                    label="Text"
                    rows={5}
                    hint="Leave an empty line between paragraphs."
                    {...register(`blocks.${index}.text`)}
                    error={rowErrors?.text?.message}
                  />
                ) : null}

                {type === 'image' ? (
                  <div className="space-y-3">
                    <Controller
                      control={control}
                      name={`blocks.${index}.url`}
                      render={({ field: f, fieldState }) => (
                        <ImageUploadField
                          label="Image"
                          value={f.value || null}
                          onChange={(url) => f.onChange(url ?? '')}
                          upload={(file) => mediaApi.uploadUrl(file, 'general')}
                          accept={ACCEPTED_IMAGE_TYPES.join(',')}
                          maxSizeMb={MAX_UPLOAD_MB}
                          previewSize={120}
                          error={fieldState.error?.message}
                        />
                      )}
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        label="Alt text"
                        hint="Describes the image for screen readers and SEO."
                        {...register(`blocks.${index}.alt`)}
                        error={rowErrors?.alt?.message}
                      />
                      <Input
                        label="Caption (optional)"
                        {...register(`blocks.${index}.caption`)}
                        error={rowErrors?.caption?.message}
                      />
                    </div>
                  </div>
                ) : null}

                {type === 'button' ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      label="Button text"
                      {...register(`blocks.${index}.label`)}
                      error={rowErrors?.label?.message}
                    />
                    <Input
                      label="Link"
                      placeholder="/products"
                      {...register(`blocks.${index}.url`)}
                      error={rowErrors?.url?.message}
                    />
                  </div>
                ) : null}
              </Card>
            );
          })}

          {errors.blocks?.message ? (
            <p className="text-sm text-red-600">{errors.blocks.message}</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {PAGE_BLOCK_TYPES.map((t) => (
              <Button
                key={t}
                type="button"
                variant="outline"
                size="sm"
                disabled={fields.length >= MAX_PAGE_BLOCKS}
                onClick={() => append(emptyBlockRow(t))}
              >
                + {PAGE_BLOCK_LABELS[t]}
              </Button>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="space-y-4">
            <CardTitle>Publishing</CardTitle>
            <Select
              label="Status"
              options={[
                { value: 'DRAFT', label: 'Draft (hidden)' },
                { value: 'PUBLISHED', label: 'Published' },
              ]}
              {...register('status')}
            />
            <Input
              label="Slug"
              placeholder={slugify(title) || 'generated-from-title'}
              hint={slug ? `URL: /pages/${slug}` : 'Leave empty to generate it from the title.'}
              {...register('slug')}
              error={errors.slug?.message}
            />
          </Card>
          <Card className="space-y-4">
            <CardTitle>Search engines</CardTitle>
            <Input
              label="SEO title"
              hint="Up to 70 characters."
              {...register('seoTitle')}
              error={errors.seoTitle?.message}
            />
            <Textarea
              label="SEO description"
              rows={3}
              hint="Up to 160 characters."
              {...register('seoDescription')}
              error={errors.seoDescription?.message}
            />
          </Card>
        </aside>
      </div>
    </form>
  );
}
