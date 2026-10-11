import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * WishlistService — Wishlists and price-drop tracking.
 *
 * Scope responsibilities:
 *  - Add/remove products; store priceAtAdd
 *  - Price-drop email trigger when product price falls
 */
@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'wishlist', status: 'scaffolded' };
  }
}
