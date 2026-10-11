import { Module } from '@nestjs/common';
import { VendorStaffController } from './vendor-staff.controller';
import { VendorStaffService } from './vendor-staff.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminVendorsController } from './admin-vendors.controller';
import { VendorSelfController } from './vendor-self.controller';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [
    VendorsController,
    VendorSelfController,
    AdminVendorsController,
    VendorStaffController,
  ],
  providers: [VendorsService, VendorStaffService],
  exports: [VendorsService],
})
export class VendorsModule {}
