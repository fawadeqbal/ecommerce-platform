import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * LoyaltyService — Points, tiers, referrals.
 *
 * Scope responsibilities:
 *  - Earn points on delivered orders, signup, reviews, referrals
 *  - Redeem points at checkout; expire points (scheduled job)
 *  - Tiers with multipliers; referral codes and rewards
 */
@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'loyalty', status: 'scaffolded' };
  }
}
