import { Body, ClassSerializerInterceptor, Get, HttpException, HttpStatus, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { BaseController } from '~decorators/version.decorator';
import { PullRequestDTO, PullRequestResponseDTO } from '~dto';
import { GithubService } from '../application/github/github.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('github')
@BaseController('github')
@UseInterceptors(ClassSerializerInterceptor)
export class GithubController {
    constructor(private readonly githubService: GithubService) { }

    @Post('store-data')
    async storeData(@Req() req: any, @Body() prMetadata: PullRequestDTO) {
        try {
            const user = req.user;
            const userId = user.id;
            const result = await this.githubService.storePullRequestData(prMetadata, userId);
            return {
                message: 'Pull Request data stored successfully.',
                data: result,
            };
        } catch (error) {
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
    @ApiResponse({ 
        status: 200, 
        description: 'List of pull requests for the authenticated user',
        type: [PullRequestResponseDTO]
    })
    async getPullRequests(@Req() req): Promise<PullRequestResponseDTO[]> {
        const userId = req.user.id;
        return this.githubService.getPullRequestsForUser(userId);
    }
}
