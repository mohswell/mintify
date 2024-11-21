// src/auth/jwt.service.ts
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtGuard {
  constructor(private readonly configService: ConfigService) {}

  sign(payload: any): string {
    return jwt.sign(payload, this.configService.get<string>('JWT_SECRET') || 'secret_key', {
      expiresIn : '7d',
    });
  }
}
