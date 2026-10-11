import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [NotificationsModule],
  controllers: [UsersController, AccountController],
  providers: [UsersService, AccountService],
  exports: [UsersService],
})
export class UsersModule {}
