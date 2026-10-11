import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * InventoryService — Stock, warehouses, reservations, alerts.
 *
 * Scope responsibilities:
 *  - Stock per variant per warehouse; adjustments with StockMovement history
 *  - Reserve stock at checkout; release on timeout/failure (maintenance queue)
 *  - Decrement on payment, restore on cancellation/return
 *  - Low-stock threshold alerts to vendors by email
 *  - Back-in-stock alerts (StockAlert) when stock returns
 */
@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'inventory', status: 'scaffolded' };
  }
}
