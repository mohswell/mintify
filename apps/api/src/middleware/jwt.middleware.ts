// src/auth/jwt.middleware.ts
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { verifyToken } from './session.middleware'; // Import the utility function
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
    constructor(private readonly configService: ConfigService) {}

    async use(req: any, res: any, next: () => void) {
        const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

        try {
            const decoded = await verifyToken(token, this.configService); // Verify token using the utility
            req.user = decoded; // Attach user data to request
            next(); // Proceed to the next middleware or route handler
        } catch (err) {
            console.error('JWT verification failed:', err);
            throw new UnauthorizedException(err.message);
        }
    }
}
