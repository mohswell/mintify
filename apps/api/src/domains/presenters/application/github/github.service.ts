import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PullRequestDTO, CommitDTO, PullRequestResponseDTO } from '~dto';
import { PrismaService } from '~factories';

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);

  constructor(private readonly prisma: PrismaService) {}

  async storePullRequestData(dto: PullRequestDTO, userId: bigint) {
    this.logger.log('Attempting to store Pull Request data');
    this.logger.log(`User ID: ${userId}`);
    this.logger.log(`PR Number: ${dto.prNumber}`);
    this.logger.log(`PR URL: ${dto.prUrl}`);

    // More robust PR number validation
    const cleanedPrNumber = parseInt(dto.prNumber.toString(), 10);
    if (isNaN(cleanedPrNumber) || cleanedPrNumber <= 0) {
      this.logger.error('Invalid PR number');
      throw new Error('Pull Request number must be a valid number');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.error(`User not found with ID: ${userId}`);
      throw new Error('Invalid user');
    }

    try {
      // Detailed logging of incoming DTO
      this.logger.log('Full DTO:', JSON.stringify(dto, null, 2));

      // First, check if a PR with this number and user already exists
      const existingPullRequest = await this.prisma.pullRequest.findFirst({
        where: {
          prNumber: parseInt(cleanedPrNumber.toString(), 10),
          userId: userId,
        },
      });

      // Determine if this is a new PR or an update
      const isNewPr = !existingPullRequest;

      // Prepare upsert data
      const pullRequestData = {
        prNumber: cleanedPrNumber,
        title: dto.prTitle,
        description: dto.description || '',
        author: dto.prAuthor,
        authorUsername: dto.authorUsername || dto.prAuthor,
        authorAvatar: dto.authorAvatar || '',
        url: dto.prUrl,
        baseBranch: dto.baseBranch,
        headBranch: dto.headBranch,
        baseRepository: dto.baseRepository,
        headRepository: dto.headRepository,
        isDraft: dto.isDraft || false,
        labels: dto.labels || [],
        reviewers: dto.reviewers || [],
        comments: dto.stats?.comments || 0,
        additions: dto.stats?.additions || 0,
        deletions: dto.stats?.deletions || 0,
        changedFiles: dto.stats?.changedFiles || 0,
        mergeable: dto.mergeable ?? null,
        createdAt: new Date(dto.createdAt),
        updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
        closedAt: dto.closedAt ? new Date(dto.closedAt) : null,
        mergedAt: dto.mergedAt ? new Date(dto.mergedAt) : null,
        userId,
      };

      // Perform upsert with more explicit update conditions
      const pullRequest = await this.prisma.pullRequest.upsert({
        where: {
          prNumber_userId: {
            prNumber: parseInt(cleanedPrNumber.toString(), 10),
            userId,
          },
        },
        update: {
          ...pullRequestData,
          prNumber: parseInt(cleanedPrNumber.toString(), 10),
          // Only update if the URL has changed or other significant fields differ
          ...(existingPullRequest && existingPullRequest.url !== dto.prUrl ? { url: dto.prUrl } : {}),
        },
        create: {
          ...pullRequestData,
          prNumber: parseInt(cleanedPrNumber.toString(), 10),
        },
      });

      this.logger.log(`Pull Request ${isNewPr ? 'created' : 'updated'} with ID: ${pullRequest.id}`);

      // Process commits if present
      if (dto.commits && dto.commits.length > 0) {
        this.logger.log(`Processing ${dto.commits.length} commits`);

        const commitPromises = dto.commits.map(async (commit) => {
          try {
            const validDate = commit.date && !isNaN(new Date(commit.date).getTime()) ? new Date(commit.date) : null;

            if (!validDate || !commit.sha) {
              this.logger.warn(`Skipping commit with invalid date or no SHA: ${JSON.stringify(commit)}`);
              return null;
            }

            // Check if commit already exists for this PR
            const existingCommit = await this.prisma.commit.findFirst({
              where: {
                commitHash: commit.sha,
                pullRequestId: pullRequest.id,
              },
            });

            if (existingCommit) {
              this.logger.log(`Commit ${commit.sha} already exists for this PR`);
              return existingCommit;
            }

            // Create new commit
            const createdCommit = await this.prisma.commit.create({
              data: {
                commitHash: commit.sha,
                message: commit.message || '',
                authorEmail: commit.authorEmail || '',
                authorName: commit.authorName || '',
                authorUsername: commit.authorUsername || '',
                committerEmail: commit.committerEmail || '',
                committerName: commit.committerName || '',
                date: validDate,
                pullRequestId: pullRequest.id,
              },
            });

            // Create commit stats if available
            if (commit.stats) {
              await this.prisma.commitStats.create({
                data: {
                  additions: commit.stats.additions || 0,
                  deletions: commit.stats.deletions || 0,
                  changedFiles: commit.stats.changedFiles || 0,
                  commitId: createdCommit.id,
                },
              });
            }

            return createdCommit;
          } catch (commitError) {
            this.logger.error(
              `Error processing individual commit: ${(commitError as any).message}`,
              (commitError as any).stack,
            );
            return null;
          }
        });

        await Promise.all(commitPromises);
      }

      return pullRequest;
    } catch (error) {
      this.logger.error(`Detailed error storing PR data: ${JSON.stringify(error, null, 2)}`);
      this.logger.error(`Error storing Pull Request data: ${(error as any).message}`, (error as any).stack);
      throw error;
    }
  }

  async getPullRequestsForUser(userId: bigint): Promise<PullRequestResponseDTO[]> {
    return await this.prisma.execute(async (prisma) => {
      const pullRequests = await prisma.pullRequest.findMany({
        where: { userId },
        include: {
          commits: {
            include: { stats: true },
            orderBy: { date: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!pullRequests || pullRequests.length === 0) {
        this.logger.warn(`No pull requests found for user ID: ${userId}`);
        return [];
      }

      this.logger.debug(`Found ${pullRequests.length} pull requests for user ID: ${userId}`);

      return pullRequests.map((pr) => ({
        id: pr.id,
        prNumber: pr.prNumber,
        title: pr.title,
        author: pr.author,
        authorUsername: pr.authorUsername,
        url: pr.url,
        baseBranch: pr.baseBranch,
        headBranch: pr.headBranch,
        status: pr.status,
        isDraft: pr.isDraft,
        labels: pr.labels,
        createdAt: pr.createdAt,
        stats: {
          additions: pr.additions,
          deletions: pr.deletions,
          changedFiles: pr.changedFiles,
        },
        commits: pr.commits.map((commit) => ({
          id: commit.id,
          commitHash: commit.commitHash,
          message: commit.message,
          authorName: commit.authorName,
          authorEmail: commit.authorEmail,
          date: commit.date,
          stats: commit.stats
            ? {
                additions: commit.stats.additions,
                deletions: commit.stats.deletions,
                changedFiles: commit.stats.changedFiles,
              }
            : undefined,
        })),
      }));
    });
  }
}
