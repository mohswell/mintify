import { Body, Post } from '@nestjs/common';
import { BaseController } from '~decorators/version.decorator';
import { PullRequestDTO } from '~dto';
import { GithubService } from '../application/github/github.service';

@BaseController('github')
export class GithubController {
    constructor(private readonly githubService: GithubService) { }

    @Post('store-data')
    async storeData(@Body() prMetadata: PullRequestDTO) {
        try {
            const result = await this.githubService.storeMetadata(prMetadata);
            return { message: 'Metadata stored successfully', data: result };
        } catch (error) {
            return { message: 'Failed to store metadata', error: (error as Error).message };
        }
    }
}
