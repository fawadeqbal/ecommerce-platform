import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationsModule } from '../notifications/notifications.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { MockGatewayController } from './mock-gateway.controller';
import { PaymentExpiryService } from './payment-expiry.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PAYMENT_PROVIDER, createPaymentProvider } from './providers';

@Module({
  imports: [NotificationsModule, LoyaltyModule],
  controllers: [MockGatewayController, PaymentsController],
  providers: [
    { provide: PAYMENT_PROVIDER, inject: [ConfigService], useFactory: createPaymentProvider },
    PaymentsService,
    PaymentExpiryService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
