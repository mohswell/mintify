import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['warn', 'error'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      console.error('Error connecting to database:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Optional: Add a method to reset the database connection
  async resetConnection() {
    await this.$disconnect();
    await this.$connect();
  }
}