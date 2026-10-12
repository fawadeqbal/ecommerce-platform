import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { AdminOrdersController } from './admin-orders.controller';
import {
  AdminDocumentsController,
  CustomerDocumentsController,
  VendorDocumentsController,
} from './documents/documents.controller';
import { DocumentsService } from './documents/documents.service';
import { OrderNotesService } from './documents/notes.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { VendorOrdersController } from './vendor-orders.controller';

@Module({
  imports: [NotificationsModule, PaymentsModule, LoyaltyModule],
  controllers: [
    OrdersController,
    VendorOrdersController,
    AdminOrdersController,
    CustomerDocumentsController,
    VendorDocumentsController,
    AdminDocumentsController,
  ],
  providers: [OrdersService, DocumentsService, OrderNotesService],
  exports: [OrdersService],
})
export class OrdersModule {}
