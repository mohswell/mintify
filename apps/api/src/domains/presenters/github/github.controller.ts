import { Body, HttpException, HttpStatus, Post, Req } from '@nestjs/common';
import { BaseController } from '~decorators/version.decorator';
import { PullRequestDTO } from '~dto';
import { GithubService } from '../application/github/github.service';

@BaseController('github')
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
}
