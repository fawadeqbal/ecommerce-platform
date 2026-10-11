import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { GiftCardsService } from './gift-cards.service';
import { AdminLoyaltyController, LoyaltyController } from './loyalty.controller';
import { LoyaltySweepService } from './loyalty-sweep.service';
import { LoyaltyService } from './loyalty.service';

@Module({
  imports: [NotificationsModule],
  controllers: [LoyaltyController, AdminLoyaltyController],
  providers: [LoyaltyService, GiftCardsService, LoyaltySweepService],
  exports: [LoyaltyService, GiftCardsService],
})
export class LoyaltyModule {}
