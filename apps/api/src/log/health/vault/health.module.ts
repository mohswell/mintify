import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaModule } from '~factories';
import { HealthController } from '../health.controller';
import { HealthService } from '../channels/health.service';

@Module({
  imports: [TerminusModule, PrismaModule],
  providers: [HealthService],
  controllers: [HealthController],
})
export class HealthModule {}
