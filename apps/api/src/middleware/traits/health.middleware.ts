import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class HealthLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HealthLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (response) => {
          const duration = Date.now() - startTime;
          this.logger.log(`Health check completed in ${duration}ms from ${request.ip}`);

          // Log any warnings or issues
          if (response?.status === 'warning' || response?.details) {
            this.logger.warn('Health check warnings:', response);
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(`Health check failed after ${duration}ms from ${request.ip}`, error.stack);
        },
      }),
    );
  }
}
