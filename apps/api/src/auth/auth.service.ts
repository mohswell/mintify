import { Injectable, InternalServerErrorException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserDto, LoginDto, GitHubLoginDto } from '~/dto';
import { JwtGuard } from './providers/guards/jwt.guard';
import { SessionGuard } from './providers/guards/session.guard';
import { UserProvider } from './providers/suppliers/user.provider';

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
      // Convert the user object to a plain object with number IDs
      return {
        ...user,
        id: Number(user.id)
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Signup error:', error);
      throw new InternalServerErrorException('Unable to complete signup. Please try again.');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.userProvider.findUserByEmail(loginDto.email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await this.userProvider.validatePassword(
        loginDto.password,
        user.password
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Convert BigInt to string for the JWT payload
      const payload = {
        sub: user.id.toString(), // Convert BigInt to string for JWT
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        isPremium: user.isPremium,
        isAdmin: user.isAdmin,
      };

      const token = this.jwtGuard.sign(payload);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000 * 7);

      // Pass the BigInt directly to createSession
      await this.sessionGuard.createSession(BigInt(user.id), token, expiresAt);

      const { password: _, ...userWithoutPassword } = user;

      // Convert BigInt to number in the response
      return {
        user: {
          ...userWithoutPassword,
          id: Number(user.id)
        },
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred during login');
    }
  }

  async githubLogin(githubLoginDto: GitHubLoginDto) {
    try {
      // Check if user exists by GitHub ID or email
      let user = await this.userProvider.findUserByGitHubOrEmail(
        githubLoginDto.githubId,
        githubLoginDto.email
      );

      // If user doesn't exist, create a new user
      if (!user) {
        user = await this.userProvider.createGitHubUser(githubLoginDto);
      }

      // Create JWT payload
      const payload = {
        sub: user.id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        isPremium: user.isPremium,
        isAdmin: user.isAdmin,
      };

      const token = this.jwtGuard.sign(payload);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000 * 7);

      // Create session
      await this.sessionGuard.createSession(BigInt(user.id), token, expiresAt);

      const { password: _, ...userWithoutPassword } = user;

      return {
        user: {
          ...userWithoutPassword,
          id: Number(user.id)
        },
        token
      };
    } catch (error) {
      console.error('GitHub login error:', error);
      throw new InternalServerErrorException('GitHub login failed');
    }
  }
}