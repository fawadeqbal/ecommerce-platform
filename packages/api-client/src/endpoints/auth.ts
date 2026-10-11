import type { AuthTokens, LoginFormValues, RegisterFormValues } from '@ecommerce/types';
import { api } from '../http';

export const authApi = {
  login: (body: LoginFormValues) => api<AuthTokens>('/auth/login', { method: 'POST', body }),
  register: (body: RegisterFormValues) =>
    api<AuthTokens>('/auth/register', { method: 'POST', body }),
  refresh: () => api<AuthTokens>('/auth/refresh', { method: 'POST', body: {} }),
  logout: () => api<void>('/auth/logout', { method: 'POST', body: {} }),
};
