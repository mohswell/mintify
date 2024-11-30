import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '~/factories';
import * as bcrypt from 'bcrypt';
import { GitHubLoginDto, UserDto } from '~dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UserProvider {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Find user by email with included sessions
   */
  async findUserByEmail(email: string) {
    try {
      console.log(`Finding user by email: ${email}`);
      const user = await this.prisma.execute(async (prisma) =>
        prisma.user.findUnique({
          where: { email },
          include: { sessions: true },
        }),
      );
      console.log(`User found: ${JSON.stringify(user)}`);
      return user ? { ...user, id: Number(user.id) } : null;
    } catch (error) {
      console.error('Error finding user by email:', (error as any).message || error);
      throw new InternalServerErrorException('Database query failed');
    }
  }

  /**
   * Create a new user with proper validation and hashed password
   */
  async createUser(data: any) {
    try {
      console.log('Creating user with data:', data);
      if (!data.email || !data.password) {
        throw new BadRequestException('Email and password are required');
      }

      const existingUser = await this.checkUserExists(data.email, data.username);
      if (existingUser) {
        throw new ConflictException('User with this email or username already exists');
      }

      const hashedPassword = await bcrypt.hash(data.password, 12);
      const user = await this.prisma.execute(async (prisma) => {
        const newUser = await prisma.user.create({
          data: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username,
            password: hashedPassword,
            isPremium: data.isPremium ?? false,
            isAdmin: data.isAdmin ?? false,
            role: data.role?.toUpperCase() ?? UserRole.USER,
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
        console.log('User created successfully:', newUser);
        return { ...newUser, id: Number(newUser.id) }; // Convert BigInt to Number
      });
      return user;
    } catch (error) {
      console.error('Error creating user:', (error as any).message || error);
      throw new InternalServerErrorException('User creation failed');
    }
  }

  /**
   * Validate the provided password against the stored hash
   */
  async validatePassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      console.log('Validating password...');
      const isValid = await bcrypt.compare(inputPassword, hashedPassword);
      console.log(`Password validation result: ${isValid}`);
      return isValid;
    } catch (error) {
      console.error('Password validation error:', (error as any).message || error);
      throw new InternalServerErrorException('Password validation failed');
    }
  }

  /**
   * Check if a user already exists by email or username
   */
  async checkUserExists(email: string, username: string) {
    try {
      console.log(`Checking if user exists with email: ${email} or username: ${username}`);
      const user = await this.prisma.execute(async (prisma) =>
        prisma.user.findFirst({
          where: {
            OR: [{ email }, { username }],
          },
        }),
      );
      console.log(`User existence check result: ${user ? 'Exists' : 'Does not exist'}`);
      return user;
    } catch (error) {
      console.error('Error checking user existence:', (error as any).message || error);
      throw new InternalServerErrorException('User existence check failed');
    }
  }
  /**
   * Create an oauth user or find one
   */
  async findUserByGitHubOrEmail(githubId: number, email: string) {
    try {
      console.log(`Finding user by GitHub ID: ${githubId} or email: ${email}`);
      const user = await this.prisma.execute(async (prisma) =>
        prisma.user.findFirst({
          where: {
            OR: [{ githubId }, { email }],
          },
          include: { sessions: true },
        }),
      );
      console.log(`User found by GitHub or email: ${JSON.stringify(user)}`);
      return user ? { ...user, id: Number(user.id) } : null;
    } catch (error) {
      console.error('Error finding user by GitHub ID or email:', (error as any).message || error);
      throw new InternalServerErrorException('User lookup failed');
    }
  }

  async createGitHubUser(data: GitHubLoginDto) {
    try {
      console.log('Creating GitHub user with data:', data);
      return this.prisma.execute(async (prisma) => {
        const existingUser = await prisma.user.findUnique({
          where: { email: data.email },
          select: { id: true, githubId: true },
        });

        // If user exists and is not already a GitHub user, throw an error
        if (existingUser && !existingUser.githubId) {
          throw new ConflictException('Email already registered with a different authentication method');
        }

        if (existingUser && existingUser.githubId) {
          console.log('User already exists with GitHub ID:', existingUser);
          return {
            ...existingUser,
            id: Number(existingUser.id),
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
            password: await bcrypt.hash(data.username, 12),
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
        console.log('GitHub user created successfully:', user);
        return { ...user, id: Number(user.id) };
      });
    } catch (error) {
      console.error('Error creating GitHub user:', (error as any).message || error);
      throw new InternalServerErrorException('GitHub user creation failed');
    }
  }
}
