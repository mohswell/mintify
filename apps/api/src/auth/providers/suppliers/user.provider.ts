import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '~/factories';
import * as bcrypt from 'bcrypt';
import { GitHubLoginDto } from '~dto';

@Injectable()
export class UserProvider {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Find user by email with included sessions
   */
  async findUserByEmail(email: string) {
    try {
      const user = await this.prisma.execute(async (prisma) =>
        prisma.user.findUnique({
          where: { email },
          include: { sessions: true },
        })
      );
      return user ? { ...user, id: Number(user.id) } : null;
    } catch (error) {
      throw new InternalServerErrorException('Database query failed');
    }
  }

  /**
   * Create a new user with proper validation and hashed password
   */
  async createUser(data: any) {
    if (!data.email || !data.password) {
      throw new BadRequestException('Email and password are required');
    }

    const existingUser = await this.checkUserExists(data.email, data.username);
    if (existingUser) {
      throw new BadRequestException('User with this email or username already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    return this.prisma.execute(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          password: hashedPassword,
          isPremium: data.isPremium ?? false,
          isAdmin: data.isAdmin ?? false,
          role: data.role?.toUpperCase() ?? 'USER',
          isInactive: data.isInactive ?? false,
          registrationDate: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          role: true,
          isPremium: true,
        },
      });
      return { ...user, id: Number(user.id) }; // Convert BigInt to Number
    });
  }

  /**
   * Validate the provided password against the stored hash
   */
  async validatePassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(inputPassword, hashedPassword);
  }

  /**
   * Check if a user already exists by email or username
   */
  async checkUserExists(email: string, username: string) {
    return this.prisma.execute(async (prisma) =>
      prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      })
    );
  }
  /**
   * Create an oauth user or find one
   */
  async findUserByGitHubOrEmail(githubId: number, email: string) {
    return this.prisma.execute(async (prisma) =>
      prisma.user.findFirst({
        where: {
          OR: [
            { githubId: githubId },
            { email: email }
          ]
        },
        include: { sessions: true }
      }).then((user) =>
        user ? { ...user, id: Number(user.id) } : null
      )
    );
  }

  async createGitHubUser(data: GitHubLoginDto) {
    return this.prisma.execute(async (prisma) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
        select: { id: true, githubId: true }
      });

      // If user exists and is not already a GitHub user, throw an error
      if (existingUser && !existingUser.githubId) {
        throw new ConflictException('Email already registered with a different authentication method');
      }
      
      if (existingUser && existingUser.githubId) {
        return {
          ...existingUser,
          id: Number(existingUser.id)
        };
      }

      // If no existing user, create a new user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          username: data.username,
          firstName: data.name?.split(' ')[0],
          lastName: data.name?.split(' ')[1] ?? 'Dev',
          githubId: data.githubId,
          role: 'USER',
          isInactive: false,
          registrationDate: new Date(),
          password: null, // GitHub users don't have a password
          avatarUrl: data.avatarUrl,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          role: true,
          isPremium: true,
          avatarUrl: true,
          isAdmin: true,
          isInactive: true,
          sessions: true,
          password: true,
        },
      });
      return { ...user, id: Number(user.id) };
    });
  }
}