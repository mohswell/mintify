import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;
  private readonly maxRetries = 3;
  private readonly connectionTimeout = 10000;

  constructor() {
    super({
      log: ['warn', 'error'],
      errorFormat: 'pretty',
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Using client extensions for query logging
    const queryLoggingExtension = Prisma.defineExtension({
      name: 'queryLogging',
      query: {
        async $allOperations({ operation, model, args, query }) {
          const start = Date.now();
          
          // Clean up any existing prepared statements before query
          try {
            await this.$executeRawUnsafe('DEALLOCATE ALL');
          } catch (e) {
            // Ignore errors from DEALLOCATE as they're not critical
          }
          
          const result = await query(args);
          const duration = Date.now() - start;
          
          if (duration > 5000) {
            this.logger.warn(`Slow query detected: ${model}.${operation} took ${duration}ms`);
          }
          
          return result;
        },
      },
    });

    this.$extends(queryLoggingExtension);
  }

  async onModuleInit() {
    let retries = 0;
    while (retries < this.maxRetries && !this.isConnected) {
      try {
        await Promise.race([
          this.$connect(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), this.connectionTimeout)
          )
        ]);
        
        this.isConnected = true;
        this.logger.log('Successfully connected to database');
        
        // Handle process termination
        process.on('beforeExit', async () => {
          await this.$disconnect();
        });

        // Clean up prepared statements on connection
        await this.$executeRawUnsafe('DEALLOCATE ALL');
        
      } catch (error) {
        retries++;
        this.logger.error(`Failed to connect to database (attempt ${retries}/${this.maxRetries}):`, error);
        
        if (retries === this.maxRetries) {
          this.logger.error('Max connection retries reached. Exiting...');
          process.exit(1);
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000 * retries));
      }
    }
  }

  async onModuleDestroy() {
    try {
      // Clean up prepared statements before disconnecting
      await this.$executeRawUnsafe('DEALLOCATE ALL');
      await this.$disconnect();
      this.isConnected = false;
      this.logger.log('Successfully disconnected from database');
    } catch (error) {
      this.logger.error('Error disconnecting from database:', error);
    }
  }

  async resetConnection() {
    try {
      // Clean up prepared statements before reset
      await this.$executeRawUnsafe('DEALLOCATE ALL');
      await this.$disconnect();
      this.isConnected = false;
      await this.onModuleInit();
      return true;
    } catch (error) {
      this.logger.error('Error resetting connection:', error);
      return false;
    }
  }

  async healthCheck() {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return false;
    }
  }

  // Helper method to clean up prepared statements
  async cleanupPreparedStatements() {
    try {
      await this.$executeRawUnsafe('DEALLOCATE ALL');
    } catch (error) {
      this.logger.error('Error cleaning up prepared statements:', error);
    }
  }
}