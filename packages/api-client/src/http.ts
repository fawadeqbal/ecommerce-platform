import type { ApiError, ApiResponse } from '@ecommerce/types';

// Next.js inlines NEXT_PUBLIC_* at build time; declared here so this package needs no @types/node.
declare const process: { env: Record<string, string | undefined> };

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiError | undefined,
  ) {
    super(
      Array.isArray(body?.message)
        ? body.message.join(', ')
        : (body?.message ?? `Request failed (${status})`),
    );
    this.name = 'ApiClientError';
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

export type RequestOptions = Omit<RequestInit, 'body'> & {
  /** JSON-serialisable value, or FormData for file uploads. */
  body?: unknown;
  /** Bearer token, for server-side calls that cannot use cookies. */
  token?: string;
  /** Next.js fetch cache options (server components). */
  next?: { revalidate?: number | false; tags?: string[] };
};

/** Fetch wrapper for the NestJS API. Sends cookies, unwraps { success, data }, throws ApiClientError. */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, headers, ...init } = options;
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      // FormData sets its own multipart boundary header.
      ...(body !== undefined && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
  });

  if (res.status === 204) return undefined as T;
  const json = (await res.json().catch(() => undefined)) as ApiResponse<T> | ApiError | undefined;
  if (!res.ok) throw new ApiClientError(res.status, json as ApiError | undefined);
  return (json as ApiResponse<T>).data;
}
