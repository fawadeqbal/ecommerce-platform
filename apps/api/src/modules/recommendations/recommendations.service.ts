import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * RecommendationsService — Related, frequently bought together, recently viewed.
 *
 * Scope responsibilities:
 *  - Record ProductView for recently viewed
 *  - Related products by category/brand/attributes
 *  - Frequently bought together from co-purchase data
 */
@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'recommendations', status: 'scaffolded' };
  }
}
