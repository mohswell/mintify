import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { PrismaModule } from '~factories';
import { HealthController } from '../health.controller';

@Module({
  imports: [TerminusModule, PrometheusModule.register(), PrismaModule],
  controllers: [HealthController],
})
export class HealthModule { }
