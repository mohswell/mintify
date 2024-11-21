import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ApiMiddleware } from './api.middleware';
import { ApiKeyService } from '~factories/api/api.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
    constructor(
        private readonly apiMiddleware: ApiMiddleware,
        private readonly apiKeyService: ApiKeyService,
    ) {}

    async use(req: any, res: any, next: () => void) {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            throw new UnauthorizedException('Authorization token is missing');
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = await this.apiMiddleware.verifyToken(token);
            req.user = await this.apiKeyService.getUserFromToken(decoded, token);
            next();
        } catch(err) {
            console.error('Token verification failed:', err);
            throw new UnauthorizedException((err as Error).message);
        }
    }
}