import { BaseController } from '~decorators/version.decorator';
import { Body, Post, HttpException, HttpStatus } from '@nestjs/common';
import { ApiKeyService } from './api.service';
// import { SkipThrottle, Throttle } from '@nestjs/throttler';

@BaseController('access-token')
export class ApiController {
    constructor(
        private readonly apiKeyService: ApiKeyService,
    ) { }

    // @Throttle('short') // Applies the short throttler I defined in app.module.ts
    @Post('generate')
    async generateToken(@Body() body: { userId: bigint }) {
        try {
            const userId = BigInt(body.userId); // Ensure bigint type
            const apiKey = await this.apiKeyService.generateApiKey(userId);
            return { message: 'API key generated successfully', apiKey };
        } catch (error) {
            console.error('Error generating API key:', error);
            throw new HttpException(
                (error as Error).message || 'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}