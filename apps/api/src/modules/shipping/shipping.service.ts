import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * ShippingService — Zones, rates, courier integrations, tracking.
 *
 * Scope responsibilities:
 *  - Shipping zones and rates (flat, weight, price, free-above, pickup)
 *  - CourierAdapter interface: rates, booking, tracking, labels
 *  - Shipment tracking updates → order status + emails
 */
@Injectable()
export class ShippingService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'shipping', status: 'scaffolded' };
  }
}
