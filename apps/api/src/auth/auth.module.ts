import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './providers/guards/jwt.guard';
import { SessionGuard } from './providers/guards/session.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UserProvider } from './providers/suppliers/user.provider';
import { PrismaModule } from '~factories';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtGuard,
    SessionGuard,
    UserProvider,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AuthModule {}
