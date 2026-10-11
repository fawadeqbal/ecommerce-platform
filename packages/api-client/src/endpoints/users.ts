import type { Role } from '@ecommerce/types';
import { api } from '../http';

export interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  roles: Role[];
}

export const usersApi = {
  me: () => api<CurrentUser>('/users/me'),
};
