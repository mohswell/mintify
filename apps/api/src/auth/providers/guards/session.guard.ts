import { Injectable } from '@nestjs/common';
import { PrismaService } from '~/factories';

@Injectable()
export class SessionGuard {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(userId: bigint, token: string, expiresAt: Date) {
    return this.prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async validateSession(token: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      return null;
    }

    return {
      ...session,
      userId: session.userId.toString(), // Convert BigInt to string
      user: {
        ...session.user,
        id: Number(session.user.id), // Convert user id to number
      },
    };
  }

  async deleteSession(token: string) {
    return this.prisma.session.delete({
      where: {
        token,
      },
    });
  }
}