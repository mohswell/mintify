import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '~/factories';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserProvider {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { sessions: true },
    });
    
    if (user) {
      return {
        ...user,
        id: Number(user.id) // Convert BigInt to Number
      };
    }
    return null;
  }

  async createUser(data: any) {
    if (!data.email || !data.password) {
      throw new BadRequestException('Email and password are required');
    }

    const existingUser = await this.checkUserExists(data.email, data.username);
    if (existingUser) {
      throw new BadRequestException('User with this email or username already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await this.prisma.user.create({
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
      }
    });

    return {
      ...user,
      id: Number(user.id) // Convert BigInt to Number
    };
  }

  async validatePassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(inputPassword, hashedPassword);
  }

  async checkUserExists(email: string, username: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });
  }
}