// src/github/github.service.ts
import { Injectable } from '@nestjs/common';
import { PullRequestDTO } from '~dto';
import { PrismaService } from '~factories';

@Injectable()
export class GithubService {
  constructor(private readonly prisma: PrismaService) {}

  async storeMetadata(prMetadata: PullRequestDTO) {
    const { prNumber, prTitle, prAuthor, prUrl, baseBranch, headBranch, commits } = prMetadata;

    try {
      // Store Pull Request Metadata
      const pullRequest = await this.prisma.pullRequest.create({
        data: {
          prNumber,
          title: prTitle,
          author: prAuthor,
          url: prUrl,
          baseBranch,
          headBranch,
        },
      });

      // Store Commit Metadata
      const commitPromises = commits.map((commit) =>
        this.prisma.commit.create({
          data: {
            sha: commit.sha,
            message: commit.message,
            authorEmail: commit.authorEmail,
            date: new Date(commit.date),
            prId: pullRequest.id,  // Link commits to the pull request
          },
        }),
      );
      await Promise.all(commitPromises);

      return pullRequest;
    } catch (error) {
      console.error('Error storing metadata:', error);
      throw new Error('Failed to store PR metadata');
    }
  }
}
