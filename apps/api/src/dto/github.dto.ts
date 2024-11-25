export class CommitDTO {
    sha: string;
    message: string;
    authorEmail: string;
    authorName: string;
    authorUsername: string;
    committerEmail: string;
    committerName: string;
    date: string;
    stats?: {
        additions: number;
        deletions: number;
        changedFiles: number;
    };
}

export class PullRequestDTO {
    prNumber: number;
    prTitle: string;
    prAuthor: string;
    prUrl: string;
    baseBranch: string;
    headBranch: string;
    description?: string;
    baseRepository: string;
    headRepository: string;
    authorUsername: string;
    authorAvatar: string;
    isDraft: boolean;
    labels: string[];
    reviewers: string[];
    stats: {
        comments: number;
        additions: number;
        deletions: number;
        changedFiles: number;
    };
    mergeable: boolean;
    createdAt: string;
    updatedAt: string;
    closedAt?: string;
    mergedAt?: string;
    commits: CommitDTO[];
}