import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;

  constructor() {
    super({
      log: ['warn', 'error'],
      errorFormat: 'pretty',
      datasources: {
        db: {
          url: `${process.env.DATABASE_URL}?pgbouncer=true`,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.log('Successfully connected to the database');
    } catch (error) {
      this.logger.error('Failed to connect to the database:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Centralized method for executing queries with improved error handling and connection management
   */
  async execute<T>(callback: (prisma: PrismaService) => Promise<T>): Promise<T> {
    if (!this.isConnected) {
      await this.onModuleInit();
    }

    try {
      // Wrap the callback in a transaction to ensure atomic operations
      return await this.$transaction(async (prisma) => {
        return await callback(prisma as unknown as PrismaService);
      });
    } catch (error) {
      this.logger.error('Query execution failed:', error);

      // Attempt to reconnect if the error suggests a connection issue
      if (this.isConnectionError(error)) {
        try {
          await this.disconnect();
          await this.onModuleInit();
        } catch (reconnectError) {
          this.logger.error('Failed to reconnect:', reconnectError);
        }
      }

      throw error;
    }
  }

  /**
   * Graceful disconnection method
   */
  private async disconnect() {
    try {
      if (this.isConnected) {
        await this.$disconnect();
        this.isConnected = false;
        this.logger.log('Database connection closed');
      }
    } catch (error) {
      this.logger.error('Error closing database connection:', error);
    }
  }

  /**
   * Check if the error is related to database connection
   */
  private isConnectionError(error: any): boolean {
    const connectionErrors = [
      'Connection lost',
      'Connection timeout',
      'Unable to connect',
      'Connection refused',
      'ECONNREFUSED',
      'network error',
    ];

    return connectionErrors.some((errType) => error.message.toLowerCase().includes(errType.toLowerCase()));
  }
}
