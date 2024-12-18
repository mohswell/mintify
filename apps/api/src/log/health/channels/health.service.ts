import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaService } from '~factories/prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Custom database health indicator
   */
  async checkDatabaseHealth(): Promise<HealthIndicatorResult> {
    try {
      // Attempt a simple query to verify database connection
      await this.prismaService.$queryRaw`SELECT 1`;

      return this.getHealthIndicatorResult('database', 'up', 'Database connection successful');
    } catch (error) {
      return this.getHealthIndicatorResult('database', 'down', `Database connection failed: ${(error as any).message}`);
    }
  }

  /**
   * Custom application-specific health check
   */
  async checkApplicationHealth(): Promise<HealthIndicatorResult> {
    const appUrl = this.configService.get<string>('APP_URL') || 'http://127.0.0.1:4000';
    const urls = [appUrl, 'https://www.google.com', 'https://api.github.com'];

    try {
      await Promise.all(urls.map((url) => this.checkUrlHealth(url)));

      return this.getHealthIndicatorResult('application', 'up', 'All external services are reachable');
    } catch (error) {
      return this.getHealthIndicatorResult(
        'application',
        'down',
        error instanceof Error ? error.message : 'External service check failed',
      );
    }
  }

  /**
   * Check individual URL health
   */
  private async checkUrlHealth(url: string, timeout = 5000): Promise<void> {
    try {
      await axios.get(url, { timeout });
    } catch (error) {
      throw new Error(`Health check failed for ${url}`);
    }
  }

  /**
   * Utility method to create consistent health indicator results
   */
  private getHealthIndicatorResult(key: string, status: 'up' | 'down', message: string): HealthIndicatorResult {
    return {
      [key]: {
        status,
        message,
      },
    };
  }
}
