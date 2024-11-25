import { Module } from '@nestjs/common';
import { GithubController } from '~domains/presenters/github/github.controller';
import { GithubService } from '~domains/presenters/application/github/github.service';
import { githubProviders } from '~domains/presenters/application/providers/github.provider';
import { PrismaService } from '~factories';

@Module({
    imports: [],
    controllers: [GithubController],
    providers: [GithubService, ...githubProviders, PrismaService],
})
export class GithubModule { }  
