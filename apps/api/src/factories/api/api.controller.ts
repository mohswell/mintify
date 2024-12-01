import { BaseController } from '~decorators/version.decorator';
import { Body, Post, Get, HttpException, HttpStatus, Request } from '@nestjs/common';
import { ApiKeyService } from './api.service';
import { ConfigService } from '@nestjs/config';
// import { SkipThrottle, Throttle } from '@nestjs/throttler';

@BaseController('access-token')
export class ApiController {
    constructor(
        private readonly apiKeyService: ApiKeyService,
        private readonly configService: ConfigService
    ) { }

    // @Throttle('short') // Applies the short throttler I defined in app.module.ts
    @Post('generate')
    async generateToken(@Body() body: { userId: bigint }) {
        try {
            const userId = BigInt(body.userId);
            const apiKey = await this.apiKeyService.generateApiKey(userId);
            const baseAppUrl = this.configService.get<string>('BASE_APP_URL');
            return { message: 'API key generated successfully', apiKey, baseAppUrl };
        } catch (error) {
            console.error('Error generating API key:', error);
            throw new HttpException(
                (error as Error).message || 'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('usage')
    async getApiKeyUsageStats(@Request() req) {
        const userId = req.user.userId;

        try {
            const usageStats = await this.apiKeyService.getApiKeyUsageStats(userId);

            // Transform data into the format expected by frontend
            const chartData = usageStats.map(stat => ({
                date: stat.date.toISOString().split('T')[0],
                usage: stat.usage
            }));

            return {
                chartData,
                totalUsage: usageStats.reduce((sum, stat) => sum + stat.usage, 0)
            };
        } catch (error) {
            console.error("Failed to retrieve API key usge stats", error);
            throw new Error('Failed to retrieve API key usage statistics');
        }
    }
}