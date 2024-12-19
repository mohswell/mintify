import { Get, Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { BaseController } from '~decorators/version.decorator';
import { Counter, Gauge, Histogram } from 'prom-client';
import { Logger } from '@nestjs/common';
import { HealthService } from './channels/health.service';
import * as os from 'os';
import * as path from 'path';

@BaseController('health')
@Injectable()
export class HealthController extends HealthIndicator {
  private requestCounter: Counter<string>;
  private applicationStatusGauge: Gauge<string>;
  private responseTimeHistogram: Histogram<string>;
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private health: HealthCheckService,
    private healthService: HealthService,
    private memoryHealthIndicator: MemoryHealthIndicator,
    private diskHealthIndicator: DiskHealthIndicator,
  ) {
    super();

    this.requestCounter = new Counter({
      name: 'nestjs_health_check_requests_total',
      help: 'Total number of health check requests',
      labelNames: ['status'],
    });

    this.applicationStatusGauge = new Gauge({
      name: 'nestjs_application_status',
      help: 'Status of the application (1=healthy, 0=unhealthy)',
    });

    this.responseTimeHistogram = new Histogram({
      name: 'nestjs_health_check_response_time_seconds',
      help: 'Histogram of response times for health checks',
      buckets: [0.1, 0.5, 1, 5, 10],
    });
  }

  private getDiskPath(): string {
    if (process.env.NODE_ENV === 'production') {
      // For Railway and Render, use the /app directory
      return '/app';
    }
    // For local development
    return process.platform === 'win32' ? path.parse(os.homedir()).root : '/';
  }

  private async checkDiskSpace() {
    try {
      const diskPath = this.getDiskPath();
      // More lenient threshold (90% usage allowed)
      return this.diskHealthIndicator.checkStorage('disk_storage', {
        thresholdPercent: 0.9,
        path: diskPath,
      });
    } catch (error) {
      this.logger.warn(`Disk check failed: ${(error as Error).message}`);
      // Return a warning instead of failing
      return this.getStatus('disk_storage', true, {
        message: 'Disk check skipped - continuing operation',
        warning: true,
      });
    }
  }

  private async checkMemory() {
    try {
      // Increase heap limit to 800MB for production
      const heapLimit =
        process.env.NODE_ENV === 'production'
          ? 800 * 1024 * 1024 // 800MB for production
          : 500 * 1024 * 1024; // 500MB for development

      return await this.memoryHealthIndicator.checkHeap('memory_heap', heapLimit);
    } catch (error) {
      this.logger.warn(`Memory check failed: ${(error as Error).message}`);
      return this.getStatus('memory_heap', true, {
        message: 'Memory warning - monitoring situation',
        warning: true,
      });
    }
  }

  @Get()
  @HealthCheck()
  async check() {
    const endTimer = this.responseTimeHistogram.startTimer();

    try {
      const result = await this.health.check([
        // Database health check
        () => this.healthService.checkDatabaseHealth(),

        // Memory check with graceful degradation
        () => this.checkMemory(),

        // Disk check with graceful degradation
        () => this.checkDiskSpace(),

        // Application health check
        () => this.healthService.checkApplicationHealth(),
      ]);

      // Check if there are any warnings
      const hasWarnings = Object.values(result.details).some((detail: any) => detail.warning);

      // Update metrics
      this.applicationStatusGauge.set(1);
      this.requestCounter.inc({ status: hasWarnings ? 'warning' : 'healthy' });

      // Modify the response to include warning status if needed
      return {
        ...result,
        status: hasWarnings ? 'warning' : result.status,
      };
    } catch (error) {
      this.logger.error('Health Check Failed', {
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
          name: (error as Error).name,
        },
      });

      this.applicationStatusGauge.set(0);
      this.requestCounter.inc({ status: 'error' });

      // Determine if this is a critical failure
      const isCritical = this.isCriticalFailure(error);

      if (isCritical) {
        throw new ServiceUnavailableException({
          statusCode: 503,
          message: 'Critical service health check failed',
          error: 'Service Unavailable',
          details: (error as Error).message,
        });
      }

      // Return degraded status for non-critical failures
      return {
        status: 'degraded',
        details: {
          error: {
            status: 'down',
            message: (error as Error).message,
          },
        },
      };
    } finally {
      endTimer();
    }
  }

  private isCriticalFailure(error: any): boolean {
    // Define what constitutes a critical failure
    const criticalErrors = ['database connection failed', 'out of memory', 'process crashed'];

    return criticalErrors.some((criticalError) => error.message?.toLowerCase().includes(criticalError));
  }
}
