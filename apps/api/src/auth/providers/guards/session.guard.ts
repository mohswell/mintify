import { Injectable } from '@nestjs/common';
import { PrismaService } from '~factories';

@Injectable()
export class SessionGuard {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(userId: bigint, token: string, expiresAt: Date): Promise<void> {
    await this.prisma.session.create({
      data: { userId, token, expiresAt },
    });
  }

  async deleteExpiredSessions(): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { expiresAt: { lte: new Date() } },
    });
  }
}
