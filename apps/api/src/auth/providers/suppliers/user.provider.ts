import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '~/factories';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserProvider {
  constructor(private readonly prisma: PrismaService) { }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { sessions: true },
    });
  }

  async createUser(data: any) {
    if (!data.email || !data.password) {
      throw new BadRequestException('Email and password are required');
    }
    try {
      const hashedPassword = await bcrypt.hash(data.password, 12); // 12 salts rounds
      return this.prisma.user.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          password: hashedPassword,
          isPremium: data.isPremium ?? false,
          isAdmin: data.isAdmin ?? false,
          role: data.role.toUpperCase() ?? 'USER',
          isInactive: data.isInactive ?? false,
        },
        // Optionally, exclude sensitive fields from the return
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
    }
    catch (err) {
      console.error('Error creating user:', err);
      throw new BadRequestException('Unable to create user');
    }
  }

  async validatePassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(inputPassword, hashedPassword);
  }
  
  async checkUserExists(email: string, username: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });
  }
}
