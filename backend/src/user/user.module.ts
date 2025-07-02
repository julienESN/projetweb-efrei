import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserEventsProcessor } from './user-events.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'user-events',
    }),
  ],
  providers: [UserService, UserResolver, UserEventsProcessor],
  exports: [UserService],
})
export class UserModule {}
