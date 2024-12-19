import { Get } from '@nestjs/common';
import { Registry } from 'prom-client';
import { BaseController } from '~decorators/version.decorator';

@BaseController('metrics')
export class MetricsController {
  constructor(private readonly registry: Registry) {}

  @Get()
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
