import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * VendorsService — Vendor onboarding, verification, profiles, staff.
 *
 * Scope responsibilities:
 *  - Vendor registration with business details and documents
 *  - Admin approval / rejection / suspension (emails via NotificationsModule)
 *  - Store profile: name, logo, banner, description, policies, payout bank details
 *  - Vendor staff accounts with permissions
 *  - Public vendor storefront endpoint
 */
@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'vendors', status: 'scaffolded' };
  }
}
