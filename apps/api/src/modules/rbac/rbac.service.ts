import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * RbacService — Roles, permissions, guards.
 *
 * Scope responsibilities:
 *  - CRUD roles and assign permissions (super admin only)
 *  - Assign roles to staff users
 *  - Expose permission matrix to admin panel
 */
@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'rbac', status: 'scaffolded' };
  }
}
