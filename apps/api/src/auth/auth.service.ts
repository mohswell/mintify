import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { UserDto, LoginDto } from '~/dto';
import { JwtGuard } from './providers/guards/jwt.guard';
import { SessionGuard } from './providers/guards/session.guard';
import { UserProvider } from './providers/suppliers/user.provider';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly sessionGuard: SessionGuard,
    private readonly jwtGuard: JwtGuard,
    private readonly userProvider: UserProvider,
  ) { }

  async signup(userDto: UserDto) {
    try {
      const user = await this.userProvider.createUser(userDto);
      return user;
    } catch (err) {
      // Handle specific Prisma errors
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation (e.g., duplicate email)
        if (err.code === 'P2002') {
          throw new ConflictException('A user with this email or username already exists');
        }
      }

      // Log the error for internal tracking
      console.error('Signup error:', err);

      // Generic server error for unexpected issues
      throw new InternalServerErrorException('Unable to complete signup. Please try again.');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    try {
      const user = await this.userProvider.findUserByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await this.userProvider.validatePassword(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Create a complex payload based on the User structure
      const payload = {
        sub: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        isPremium: user.isPremium,
        isAdmin: user.isAdmin,
      };

      const token = this.jwtGuard.sign(payload);

      // Create session
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000 * 7); // 7 days
      await this.sessionGuard.createSession(user.id, token, expiresAt);

      // Filter sensitive info
      const { password: _, ...userWithoutPassword } = user;

      return { user: userWithoutPassword, token };
    }
    catch (err) {
      throw new Error(`Internal server error: ${(err as any).message}`);
    }
  }
}