import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '~/factories';

@Injectable()
export class SessionGuard {
  private readonly logger = new Logger(SessionGuard.name);

  constructor(private readonly prisma: PrismaService) { }

  async createSession(userId: bigint, token: string, expiresAt: Date) {
    try {
      return await this.prisma.execute(async (prisma) => {
        try {
          const existingSession = await prisma.session.findFirst({
            where: { userId },
          });

          // If session exists, update it instead of creating a new one
          if (existingSession) {
            return await prisma.session.update({
              where: { id: existingSession.id },
              data: {
                token,
                expiresAt,
                createdAt: new Date(), // Reset created at timestamp
              },
            });
          }

          // Create a new session
          return await prisma.session.create({
            data: {
              userId,
              token,
              expiresAt,
              createdAt: new Date(),
            },
          });
        } catch (innerError) {
          this.logger.error(
            `Error in createSession inner transaction: ${(innerError as any).message}`,
            (innerError as any).stack,
          );
          throw new InternalServerErrorException({
            message: 'Failed to create or update session',
            details: (innerError as any).message,
            userId: userId.toString(),
          });
        }
      });
    } catch (outerError) {
      this.logger.error(
        `Error in createSession outer method: ${(outerError as any).message}`,
        (outerError as any).stack,
      );
      throw new InternalServerErrorException({
        message: 'Session creation failed',
        details: (outerError as any).message,
        userId: userId.toString(),
      });
    }
  }

  async validateSession(token: string) {
    try {
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
    } catch (error) {
      //this.logger.error(`Error validating session: ${(error as any).message}`, (error as any).stack);
      throw new InternalServerErrorException({
        message: 'Session validation failed',
        details: (error as any).message,
      });
    }
  }

  async deleteSession(token: string) {
    try {
      return await this.prisma.session.delete({
        where: {
          token,
        },
      });
    } catch (error) {
      this.logger.error(`Error deleting session: ${(error as any).message}`, (error as any).stack);
      throw new InternalServerErrorException({
        message: 'Session deletion failed',
        details: (error as any).message,
      });
    }
  }

  async findActiveSessions(userId: bigint) {
    try {
      return await this.prisma.session.findMany({
        where: {
          userId,
          expiresAt: {
            gt: new Date(),
          },
        },
      });
    } catch (error) {
      this.logger.error(`Error finding active sessions: ${(error as any).message}`, (error as any).stack);
      throw new InternalServerErrorException({
        message: 'Failed to find active sessions',
        details: (error as any).message,
      });
    }
  }
}
