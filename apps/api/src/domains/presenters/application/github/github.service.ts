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

        const prNumber = Number(dto.prNumber);
        if (isNaN(prNumber)) {
            throw new Error('Pull Request number must be a number');
        }

        try {
            const { commits, stats, ...prData } = dto;

            // Validate required fields
            if (!prNumber) {
                throw new Error('Pull Request number is required');
            }

            const pullRequest = await this.prisma.pullRequest.create({
                data: {
                    prNumber,
                    title: prData.prTitle,
                    description: prData.description || '',
                    author: prData.prAuthor,
                    authorUsername: prData.authorUsername || prData.prAuthor,
                    authorAvatar: prData.authorAvatar || '',
                    url: prData.prUrl,
                    baseBranch: prData.baseBranch,
                    headBranch: prData.headBranch,
                    baseRepository: prData.baseRepository,
                    headRepository: prData.headRepository,
                    isDraft: prData.isDraft || false,
                    labels: prData.labels || [],
                    reviewers: prData.reviewers || [],
                    comments: stats.comments || 0,
                    additions: stats.additions || 0,
                    deletions: stats.deletions || 0,
                    changedFiles: stats.changedFiles || 0,
                    mergeable: prData.mergeable ?? null,
                    createdAt: new Date(prData.createdAt),
                    updatedAt: prData.updatedAt ? new Date(prData.updatedAt) : undefined,
                    closedAt: prData.closedAt ? new Date(prData.closedAt) : undefined,
                    mergedAt: prData.mergedAt ? new Date(prData.mergedAt) : undefined,
                    userId,
                },
            });

            this.logger.log(`Pull Request created with ID: ${pullRequest.id}`);

            if (commits && commits.length > 0) {
                this.logger.log(`Processing ${commits.length} commits`);
                const commitPromises = commits.map(async (commit: CommitDTO) => {
                    try {
                        // Validate the commit date
                        const validDate = commit.date && !isNaN(new Date(commit.date).getTime())
                            ? new Date(commit.date)
                            : null;

                        if (!validDate || !commit.sha) {
                            this.logger.warn(`Skipping commit with invalid date or no SHA: ${JSON.stringify(commit)}`);
                            return null;
                        }

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
                        this.logger.error(`Error processing commit: ${(commitError as any).message}`, (commitError as any).stack);
                        return null;
                    }
                });

                await Promise.all(commitPromises);
            }

            return pullRequest;
        } catch (error) {
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