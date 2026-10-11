import type { ApiError, ApiResponse } from '@ecommerce/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiError | undefined,
  ) {
    super(
      Array.isArray(body?.message) ? body.message.join(', ') : (body?.message ?? `HTTP ${status}`),
    );
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  token?: string;
  /** Next.js fetch cache options for server components. */
  next?: { revalidate?: number | false; tags?: string[] };
};

/** Typed fetch wrapper for the NestJS API. Unwraps { success, data }. */
export async function api<T>(
  path: string,
  { body, token, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 204) return undefined as T;
  const json = (await res.json().catch(() => undefined)) as ApiResponse<T> | ApiError | undefined;
  if (!res.ok) throw new ApiClientError(res.status, json as ApiError | undefined);
  return (json as ApiResponse<T>).data;
}
