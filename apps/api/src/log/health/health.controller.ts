import { Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { BaseController } from '~decorators/version.decorator';

@BaseController('health')
export class HealthController {
    constructor(private health: HealthCheckService) { }

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([]);
    }
}