import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * AuditService — Audit logs of admin and vendor actions.
 *
 * Scope responsibilities:
 *  - AuditService.log() used by other modules
 *  - Admin audit log viewer with filters
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'audit', status: 'scaffolded' };
  }
}
