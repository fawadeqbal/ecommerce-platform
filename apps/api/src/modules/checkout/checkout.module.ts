import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { ShippingModule } from '../shipping/shipping.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';

@Module({
  imports: [
    CartModule,
    NotificationsModule,
    PaymentsModule,
    ShippingModule,
    PromotionsModule,
    LoyaltyModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}
