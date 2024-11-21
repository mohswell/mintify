import { PrismaClient } from '@prisma/client';

const Prisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  Prisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') Prisma.prisma = prisma;