import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * CartService — Cart, save for later, guest cart merge.
 *
 * Scope responsibilities:
 *  - Persistent cart for users; guest cart by sessionId
 *  - Merge guest cart into user cart on login
 *  - Real-time stock & price validation
 *  - Apply coupon / gift card; estimate shipping & tax
 *  - Group items by vendor for display
 */
@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'cart', status: 'scaffolded' };
  }
}
