import { BadRequestException, Body, ClassSerializerInterceptor, Get, HttpException, HttpStatus, NotFoundException, Post, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { BaseController } from '~decorators/version.decorator';
import { PullRequestDTO, PullRequestResponseDTO } from '~dto';
import { GithubService } from '../application/github/github.service';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('github')
@BaseController('github')
@UseInterceptors(ClassSerializerInterceptor)
export class GithubController {
    constructor(
        private readonly githubService: GithubService
    ) { }

    @Post('store-data')
    async storeData(@Req() req: any, @Body() prMetadata: any) {
        console.log('Received request to store Pull Request data', req.body);
        try {
            const user = req.user;
            const userId = user.id;
            const result = await this.githubService.storePullRequestData(prMetadata, userId);
            return {
                message: 'Pull Request data stored successfully.',
                data: result,
            };
        } catch (error) {
            console.error('Error storing pull request data:', error);
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: 'Failed to store Pull Request data.',
                    details: (error as any).message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

    }

    @Get('pull-requests')
    @ApiQuery({
        name: 'userId',
        required: false,
        description: 'Optional user ID to fetch pull requests for a specific user',
        type: String,
    })
    @ApiResponse({
        status: 200,
        description: 'List of pull requests for the authenticated user',
        type: [PullRequestResponseDTO]
    })
    async getPullRequests(
        @Req() req,
        @Query('userId') userIdParam?: string,
    ): Promise<PullRequestResponseDTO[]> {
        const userId = userIdParam ? BigInt(userIdParam) : req.user.id;

        if (!userId) {
            throw new BadRequestException('User ID is missing in the request');
        }

        try {
            return await this.githubService.getPullRequestsForUser(userId);
        } catch (error) {
            throw new NotFoundException('Could not fetch pull requests');
        }
    }

}
