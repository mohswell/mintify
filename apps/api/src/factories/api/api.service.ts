import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '~factories/prisma/prisma.service';
import { randomBytes } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

interface ApiKeyPayload {
    key: string;
    userId?: bigint;
    createdAt?: Date;
}

interface DecodedToken {
    type: 'jwt' | 'apiKey';
    sub?: string | number;
    [key: string]: any;
    userId?: bigint;
  }

@Injectable()
export class ApiKeyService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) { }

    // Generate an API key for the user
    async generateApiKey(userId: bigint): Promise<string> {
        const key = randomBytes(32).toString('hex'); // Generate a 64-character API key
        const jwtSecret = this.configService.get<string>('JWT_SECRET');

        const payload: ApiKeyPayload = { 
            key, 
            userId, 
            createdAt: new Date() 
        };

        const apiKey = jwt.sign(payload, jwtSecret);
        await this.prisma.apiKey.create({
            data: {
                userId,
                apiKey,
            },
        });

        return apiKey;
    }

    // Verify the API key
    async verifyApiKey(apiKey: string): Promise<boolean> {
        try {
            const jwtSecret = this.configService.get<string>('JWT_SECRET');
            const decoded = jwt.verify(apiKey, jwtSecret) as  ApiKeyPayload;

            const key = await this.prisma.apiKey.findUnique({
                where: { apiKey },
            });

            if (!key || key.status !== 'ACTIVE' && decoded.key !== key.apiKey) {
                throw new UnauthorizedException('Invalid API key');
            }

            await this.prisma.apiKey.update({
                where: { apiKey },
                data: {
                    usageCount: { increment: 1 },
                    lastUsedAt: new Date(),
                },
            });

            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid API key');
        }
    }

    async decodeApiKey(apiKey: string): Promise<ApiKeyPayload> {
        try {
            const jwtSecret = this.configService.get<string>('JWT_SECRET');
            return jwt.verify(apiKey, jwtSecret) as ApiKeyPayload;
        } catch (error) {
            throw new UnauthorizedException('Invalid API key');
        }
    }
    async getUserFromToken(decoded: DecodedToken, token: string): Promise<any> {
        if (decoded.type === 'jwt') {
            // For JWT tokens, fetch additional user information
            const user = await this.prisma.user.findUnique({
                where: { id: BigInt(decoded.sub) },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    username: true,
                    role: true,
                    isPremium: true,
                    isAdmin: true,
                    isInactive: true,
                    maxRequestsPerDay: true,
                }
            });

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            return {
                ...user,
                id: Number(user.id),
                type: 'jwt'
            };
        } else if (decoded.type === 'apiKey') {
            const apiKeyPayload = await this.decodeApiKey(token);

            // Fetch user associated with the API key
            const user = await this.prisma.user.findUnique({
                where: { id: apiKeyPayload.userId },
                select: {
                    id: true,
                    email: true,
                    role: true,
                }
            });

            if (!user) {
                throw new UnauthorizedException('User not found for API key');
            }

            return {
                ...user,
                id: Number(user.id),
                type: 'apiKey'
            };
        }
    }
}