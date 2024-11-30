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
      return {
        ...user,
        id: typeof user.id === 'bigint' ? Number(user.id) : user.id,
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

      const isPasswordValid = await this.userProvider.validatePassword(loginDto.password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Safely convert user.id to string, handling both number and bigint
      const userIdString = user.id.toString();

      const payload = {
        sub: userIdString,
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

      // Ensure user.id is converted to BigInt
      const userId = typeof user.id === 'bigint' ? user.id : BigInt(user.id);

      // Optional: Invalidate any existing active sessions for this user
      const existingActiveSessions = await this.sessionGuard.findActiveSessions(userId);
      for (const session of existingActiveSessions) {
        await this.sessionGuard.deleteSession(session.token);
      }

      // Create new session
      await this.sessionGuard.createSession(userId, token, expiresAt);

      // Exclude sessions from the returned user object
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, sessions: _, ...userWithoutSensitiveData } = user;

      return {
        user: {
          ...userWithoutSensitiveData,
          id: typeof user.id === 'bigint' ? Number(user.id) : user.id,
        },
        token,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new InternalServerErrorException('An error occurred during login');
    }
  }

  async githubLogin(githubLoginDto: GitHubLoginDto) {
    try {
      let user = await this.userProvider.findUserByGitHubOrEmail(githubLoginDto.githubId, githubLoginDto.email);

      if (!user) {
        user = (await this.userProvider.createGitHubUser(githubLoginDto)) as any;
      }

      // Safely convert user.id to string, handling both number and bigint
      const userIdString = user.id.toString();

      const payload = {
        sub: userIdString,
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

      // Ensure user.id is converted to BigInt
      await this.sessionGuard.createSession(typeof user.id === 'bigint' ? user.id : BigInt(user.id), token, expiresAt);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      return {
        user: {
          ...userWithoutPassword,
          id: typeof user.id === 'bigint' ? Number(user.id) : user.id,
        },
        token,
      };
    } catch (error) {
      console.error('GitHub login error:', error);
      throw new InternalServerErrorException('GitHub login failed');
    }
  }
}
