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
    async generateToken(@Body() userId: bigint) {
        try {
            const user = await this.apiKeyService.generateApiKey(userId);
            return { message: 'User created successfully', user };
        } catch (error) {
            throw new HttpException((error as Error).message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}