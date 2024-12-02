import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PullRequestDTO, CommitDTO, PullRequestResponseDTO } from '~dto';
import { PrismaService } from '~factories';

@Injectable()
export class GithubService {
    private readonly logger = new Logger(GithubService.name);

    constructor(private readonly prisma: PrismaService) { }

    async storePullRequestData(dto: PullRequestDTO, userId: bigint) {
        this.logger.log('Attempting to store Pull Request data');
        this.logger.log(JSON.stringify(dto, null, 2));

        // Validate input parameters
        if (!dto) {
            throw new Error('Pull Request data is required');
        }

        const prNumber = Number(dto.prNumber);
        if (isNaN(prNumber)) {
            throw new Error('Pull Request number must be a valid number');
        }

        // Verify user exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('Invalid user');
        }

        try {
            const { commits, stats, ...prData } = dto;

            // Perform an upsert operation for the Pull Request
            const pullRequest = await this.prisma.pullRequest.upsert({
                where: {
                    // Use a unique constraint for prNumber and userId
                    prNumber_userId: {
                        prNumber: prNumber,
                        userId: userId
                    }
                },
                update: {
                    // Spread out all fields with default fallback values
                    ...this.preparePullRequestData(prData, stats),
                    updatedAt: new Date(), // Always update the timestamp
                },
                create: {
                    ...this.preparePullRequestData(prData, stats),
                    prNumber,
                    userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            this.logger.log(`Pull Request processed with ID: ${pullRequest.id}`);

            // Process commits if present
            if (commits && commits.length > 0) {
                await this.processCommits(commits, pullRequest.id);
            }

            return pullRequest;
        } catch (error) {
            this.logger.error(`Error storing Pull Request data: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
                error instanceof Error ? error.stack : '');
            throw error;
        }
    }

    // Helper method to prepare pull request data
    private preparePullRequestData(prData: Partial<PullRequestDTO>, stats: any) {
        return {
            title: prData.prTitle || '',
            description: prData.description || '',
            author: prData.prAuthor || '',
            authorUsername: prData.authorUsername || prData.prAuthor || '',
            authorAvatar: prData.authorAvatar || '',
            url: prData.prUrl || '',
            baseBranch: prData.baseBranch || '',
            headBranch: prData.headBranch || '',
            baseRepository: prData.baseRepository || '',
            headRepository: prData.headRepository || '',
            isDraft: prData.isDraft || false,
            labels: prData.labels || [],
            reviewers: prData.reviewers || [],
            comments: stats?.comments || 0,
            additions: stats?.additions || 0,
            deletions: stats?.deletions || 0,
            changedFiles: stats?.changedFiles || 0,
            mergeable: prData.mergeable ?? null,
            createdAt: prData.createdAt ? new Date(prData.createdAt) : new Date(),
            closedAt: prData.closedAt ? new Date(prData.closedAt) : null,
            mergedAt: prData.mergedAt ? new Date(prData.mergedAt) : null,
        };
    }

    // Helper method to process commits
    private async processCommits(commits: CommitDTO[], pullRequestId: number) {
        this.logger.log(`Processing ${commits.length} commits`);

        const commitPromises = commits.map(async (commit: CommitDTO) => {
            try {
                // Validate commit date and SHA
                const validDate = commit.date && !isNaN(new Date(commit.date).getTime())
                    ? new Date(commit.date)
                    : new Date(); // Fallback to current date if invalid

                if (!commit.sha) {
                    this.logger.warn(`Skipping commit with no SHA: ${JSON.stringify(commit)}`);
                    return null;
                }

                // Create commit
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
                        pullRequestId: pullRequestId,
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
                this.logger.error(`Error processing individual commit: ${commitError instanceof Error ? commitError.message : JSON.stringify(commitError)}`,
                    commitError instanceof Error ? commitError.stack : '');
                return null;
            }
        });

        // Wait for all commits to be processed
        await Promise.all(commitPromises);
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