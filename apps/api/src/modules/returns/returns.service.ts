import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * ReturnsService — Returns, exchanges, refunds (RMA).
 *
 * Scope responsibilities:
 *  - Customer return request with reason and images
 *  - Admin/vendor approve or reject, receive items, restock
 *  - Issue refund (PaymentsModule) or store credit; emails at each step
 */
@Injectable()
export class ReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'returns', status: 'scaffolded' };
  }
}
