import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * MarketingService — Email campaigns, abandoned cart, newsletters.
 *
 * Scope responsibilities:
 *  - Newsletter subscribe / confirm / unsubscribe
 *  - Campaigns to segments with scheduling (marketing queue)
 *  - Abandoned cart sequences with configurable delays
 *  - Win-back and review-request emails
 */
@Injectable()
export class MarketingService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'marketing', status: 'scaffolded' };
  }
}
