import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor() {
    super({
      log: ['warn', 'error'],
      errorFormat: 'minimal',
      datasources: {
        db: {
          url: `${process.env.DATABASE_URL}?pgbouncer=true&connection_limit=5&pool_timeout=20`,
        },
      },
    });
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    // If already connecting, wait for that connection to complete
    if (this.connectionPromise) {
      await this.connectionPromise;
      return;
    }

    // If already connected, do nothing
    if (this.isConnected) {
      return;
    }

    // Create new connection promise
    this.connectionPromise = this.connectWithRetry();

    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async connectWithRetry(retryCount = 0): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.$connect();
        this.isConnected = true;
        this.logger.log('Successfully connected to the database');
      }
    } catch (error) {
      if (retryCount < this.maxRetries) {
        this.logger.warn(`Connection attempt ${retryCount + 1} failed, retrying...`);
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        await this.connectWithRetry(retryCount + 1);
      } else {
        this.logger.error('Failed to connect to the database after multiple attempts:', error);
        throw error;
      }
    }
  }

  async execute<T>(callback: (prisma: PrismaService) => Promise<T>): Promise<T> {
    await this.connect();

    try {
      return await this.$transaction(async (prisma) => callback(prisma as unknown as PrismaService), {
        maxWait: 5000,
        timeout: 10000,
        isolationLevel: 'ReadCommitted',
      });
    } catch (error) {
      if (this.isConnectionError(error)) {
        this.isConnected = false;
        await this.disconnect();
        throw new Error('Database connection error. Please retry.');
      }
      throw error;
    }
  }

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

  private isConnectionError(error: any): boolean {
    return [
      'connection lost',
      'connection timeout',
      'unable to connect',
      'connection refused',
      'econnrefused',
      'network error',
    ].some((errType) => error?.message?.toLowerCase().includes(errType));
  }
}
