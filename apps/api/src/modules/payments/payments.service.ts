import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * PaymentsService — Gateway abstraction, webhooks, refunds, COD.
 *
 * Scope responsibilities:
 *  - PaymentProvider interface (createIntent, capture, refund, verifyWebhook)
 *  - Webhook endpoint with signature verification (uses rawBody) + WebhookEvent idempotency
 *  - Cash on Delivery rules: zones, max order value, fee
 *  - Refunds (full/partial) and payment reconciliation
 */
@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'payments', status: 'scaffolded' };
  }
}
