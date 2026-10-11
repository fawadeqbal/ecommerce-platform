import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * CheckoutService — Checkout orchestration, totals, validation.
 *
 * Scope responsibilities:
 *  - Validate cart, address, shipping method per vendor
 *  - Compute totals via PricingModule + PromotionsModule + LoyaltyModule
 *  - Reserve inventory; create Order + VendorOrders in one transaction (idempotency key)
 *  - Hand off to PaymentsModule (online) or confirm COD
 *  - Enqueue order confirmation email
 */
@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'checkout', status: 'scaffolded' };
  }
}
