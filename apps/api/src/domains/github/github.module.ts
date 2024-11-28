import { Module } from '@nestjs/common';
import { GithubController } from '~domains/presenters/github/github.controller';
import { GithubService } from '~domains/presenters/application/github/github.service';
import { githubProviders } from '~domains/presenters/application/providers/github.provider';
import { PrismaService } from '~factories';
import { FileAnalysisService } from '~domains/presenters/sanctum/analysis.service';
import { FileProvider } from '~domains/presenters/application/providers/file.provider';

@Module({
    imports: [],
    controllers: [GithubController],
    providers: [GithubService, ...githubProviders, PrismaService, FileAnalysisService, FileProvider],
})
export class GithubModule { }  
