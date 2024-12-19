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

@BaseController('health')
@Injectable()
export class HealthController extends HealthIndicator {
  private requestCounter: Counter<string>;
  private applicationStatusGauge: Gauge<string>;
  private responseTimeHistogram: Histogram<string>;
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private health: HealthCheckService,
    private healthService: HealthService, // Inject the new service
    private memoryHealthIndicator: MemoryHealthIndicator,
    private diskHealthIndicator: DiskHealthIndicator,
  ) {
    super();

    // Initialize Prometheus metrics with unique names to prevent potential collisions
    this.requestCounter = new Counter({
      name: 'nestjs_health_check_requests_total',
      help: 'Total number of health check requests',
    });

    this.applicationStatusGauge = new Gauge({
      name: 'nestjs_application_status',
      help: 'Status of the application (1=healthy, 0=unhealthy)',
    });

    this.responseTimeHistogram = new Histogram({
      name: 'nestjs_health_check_response_time_seconds',
      help: 'Histogram of response times for health checks',
      buckets: [0.1, 0.5, 1, 5, 10], // Configurable buckets for response times
    });
  }

  @Get()
  @HealthCheck()
  async check() {
    // Use a more precise timer start
    const endTimer = this.responseTimeHistogram.startTimer();

    // Increment request counter safely
    this.requestCounter.inc();

    try {
      const result = await this.health.check([
        // Database connection health
        () => this.healthService.checkDatabaseHealth(),

        // Memory usage check with more robust configuration
        async () => this.memoryHealthIndicator.checkHeap('memory_heap', 500 * 1024 * 1024), // Increased to 500 MB

        // Disk health check with more flexible configuration
        async () =>
          this.diskHealthIndicator.checkStorage('disk_storage', {
            thresholdPercent: 0.75, // More lenient threshold
            path: process.platform === 'win32' ? 'C:/' : '/',
          }),

        // Custom application-specific checks
        () => this.healthService.checkApplicationHealth(),
      ]);

      // Set application status to healthy
      this.applicationStatusGauge.set(1);

      return result;
    } catch (error) {
      // More comprehensive error logging
      this.logger.error('Detailed Health Check Failure', {
        message: (error as any).message,
        stack: (error as any).stack,
        name: (error as any).name,
      });

      // Set application status to unhealthy
      this.applicationStatusGauge.set(0);

      // Throw a service unavailable exception with more context
      throw new ServiceUnavailableException({
        statusCode: 503,
        message: 'Service health check failed',
        error: 'Service Unavailable',
        details: (error as any).message,
      });
    } finally {
      // Ensure timer is always stopped
      endTimer();
    }
  }
}
