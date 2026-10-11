import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * OrdersService — Orders, vendor sub-orders, status lifecycle.
 *
 * Scope responsibilities:
 *  - Customer: list/detail, cancel before shipment, reorder, invoice PDF
 *  - Vendor: list own VendorOrders, update status, packing slips
 *  - Admin: all orders, manual order creation, notes, status changes
 *  - Every status change writes OrderStatusHistory and enqueues the matching email
 */
@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'orders', status: 'scaffolded' };
  }
}
