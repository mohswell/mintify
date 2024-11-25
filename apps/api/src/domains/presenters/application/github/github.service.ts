import { Injectable } from '@nestjs/common';
import { PullRequestDTO, CommitDTO } from '~dto';
import { PrismaService } from '~factories';

@Injectable()
export class GithubService {
    constructor(private readonly prisma: PrismaService) {}

    async storePullRequestData(dto: PullRequestDTO, userId: bigint) {
        const { commits, stats, ...prData } = dto;

        const pullRequest = await this.prisma.pullRequest.create({
            data: {
                prNumber: prData.prNumber,
                title: prData.prTitle,
                description: prData.description,
                author: prData.prAuthor,
                authorUsername: prData.authorUsername,
                authorAvatar: prData.authorAvatar,
                url: prData.prUrl,
                baseBranch: prData.baseBranch,
                headBranch: prData.headBranch,
                baseRepository: prData.baseRepository,
                headRepository: prData.headRepository,
                isDraft: prData.isDraft,
                labels: prData.labels,
                reviewers: prData.reviewers,
                comments: stats.comments,
                additions: stats.additions,
                deletions: stats.deletions,
                changedFiles: stats.changedFiles,
                mergeable: prData.mergeable,
                createdAt: new Date(prData.createdAt),
                updatedAt: prData.updatedAt ? new Date(prData.updatedAt) : null,
                closedAt: prData.closedAt ? new Date(prData.closedAt) : null,
                mergedAt: prData.mergedAt ? new Date(prData.mergedAt) : null,
                user: {
                    connect: { id: userId }, // Connect the pr to the user
                },
            },
        });

        if (commits && commits.length > 0) {
            await Promise.all(
                commits.map(async (commit: CommitDTO) => {
                    // First, create the Commit
                    const createdCommit = await this.prisma.commit.create({
                        data: {
                            commitHash: commit.sha,
                            message: commit.message,
                            authorEmail: commit.authorEmail,
                            authorName: commit.authorName,
                            authorUsername: commit.authorUsername,
                            committerEmail: commit.committerEmail,
                            committerName: commit.committerName,
                            date: new Date(commit.date),
                            pullRequest: {
                                connect: { id: pullRequest.id },
                            },
                        },
                    });
                    if (commit.stats) {
                        await this.prisma.commitStats.create({
                            data: {
                                additions: commit.stats.additions,
                                deletions: commit.stats.deletions,
                                changedFiles: commit.stats.changedFiles,
                                commitId: createdCommit.id, 
                            },
                        });
                    }
                }),
            );
        }

        return pullRequest;
    }
}