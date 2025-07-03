import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '../src/auth/auth.service';
import { AuthResolver } from '../src/auth/auth.resolver';
import { LocalStrategy } from '../src/auth/strategies/local.strategy';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { TestUserService } from './test-user.service';
import { UserResolver } from '../src/user/user.resolver';
import { UserEventsProcessor } from '../src/user/user-events.processor';
import { getQueueToken } from '@nestjs/bullmq';
import { UserService } from '../src/user/user.service';

// Mock pour la queue user-events
const mockUserEventsQueue = {
  add: jest.fn().mockResolvedValue({}),
  process: jest.fn(),
  close: jest.fn(),
};

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    LocalStrategy,
    JwtStrategy,
    {
      provide: UserService,
      useClass: TestUserService,
    },
    UserResolver,
    UserEventsProcessor,
    {
      provide: getQueueToken('user-events'),
      useValue: mockUserEventsQueue,
    },
  ],
  exports: [AuthService, JwtModule, UserService],
})
export class TestAuthModule {}
