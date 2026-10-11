import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * PromotionsService — Coupons, flash sales, BOGO, gift cards.
 *
 * Scope responsibilities:
 *  - Coupons: percentage / fixed / free shipping with limits and restrictions
 *  - Automatic promotions: flash sale, buy-X-get-Y, tiered
 *  - Gift cards: issue, balance, redeem
 *  - Stacking rules between coupons, gift cards and loyalty points
 */
@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'promotions', status: 'scaffolded' };
  }
}
