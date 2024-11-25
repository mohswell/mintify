import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

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
      this.logger.log('Successfully connected to the database');
    } catch (error) {
      this.logger.error('Failed to connect to the database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Database connection closed');
    } catch (error) {
      this.logger.error('Error closing database connection:', error);
    }
  }

  /**
   * Centralized method for executing queries with proper error handling
   */
  async execute<T>(callback: (prisma: PrismaService) => Promise<T>): Promise<T> {
    try {
      const result = await callback(this);
      return result;
    } catch (error) {
      this.logger.error('Query execution failed:', error);
      throw error;
    } finally {
      await this.$disconnect(); // Ensure the connection is closed
    }
  }  
}
