import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * PayoutsService — Vendor commissions, settlements, payouts.
 *
 * Scope responsibilities:
 *  - Commission rules: global, per category, per vendor
 *  - Settlement cycle job builds Payouts from delivered VendorOrders minus refunds
 *  - Mark paid, payout reports, payout email
 */
@Injectable()
export class PayoutsService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'payouts', status: 'scaffolded' };
  }
}
