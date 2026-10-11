import { z } from 'zod';
import { SLUG_REGEX } from '../utils/slugify';

/** Optional slug field: '' means "generate from name". */
export const optionalSlugField = z
  .string()
  .trim()
  .max(140)
  .refine((v) => v === '' || SLUG_REGEX.test(v), 'Lowercase letters, numbers and hyphens only');

/** Optional http(s) URL field: '' means "not set". */
export const optionalUrlField = z
  .string()
  .trim()
  .refine(
    (v) => v === '' || /^https?:\/\/\S+$/.test(v),
    'Must be a valid URL starting with http:// or https://',
  );

/** '' -> null, otherwise trimmed. */
export const emptyToNull = (s: string): string | null => (s.trim() === '' ? null : s.trim());
