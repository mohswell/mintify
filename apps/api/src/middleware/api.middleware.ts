import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ApiKeyService } from '~factories/api/api.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

interface DecodedToken {
  type: 'jwt' | 'apiKey';
  sub?: string | number;
  [key: string]: any;
  userId?: bigint;
}

@Injectable()
export class ApiMiddleware {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly configService: ConfigService,
  ) { }

  async verifyToken(token: string): Promise<DecodedToken> {
    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    try {
      // First, attempt API key verification
      try {
        await this.apiKeyService.verifyApiKey(token);
        const decoded = jwt.decode(token) as jwt.JwtPayload;
        return {
          type: 'apiKey',
          sub: decoded.userId,
          userId: BigInt(decoded.userId)
        };
      } catch (apiKeyError) {
        // If API key fails, try JWT verification
        const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
        
        return {
          type: 'jwt',
          ...decoded
        };
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}