import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CommitStatsDTO {
    @IsNumber()
    @IsOptional()
    additions: number;

    @IsNumber()
    @IsOptional()
    deletions: number;

    @IsNumber()
    @IsOptional()
    changedFiles: number;
}

export class CommitDTO {
    @IsString()
    sha: string;

    @IsString()
    message: string;

    @IsString()
    authorEmail: string;

    @IsString()
    authorName: string;

    @IsString()
    authorUsername: string;

    @IsString()
    committerEmail: string;

    @IsString()
    committerName: string;

    @IsDateString()
    date?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => CommitStatsDTO)
    stats?: CommitStatsDTO;
}

export class StatsDTO {
    @IsNumber()
    comments: number;

    @IsNumber()
    additions: number;

    @IsNumber()
    deletions: number;

    @IsNumber()
    changedFiles: number;
}

export class PullRequestDTO {
    @IsNumber()
    prNumber: number | string;

    @IsString()
    prTitle: string;

    @IsString()
    prAuthor: string;

    @IsString()
    prUrl: string;

    @IsString()
    baseBranch: string;

    @IsString()
    headBranch: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    baseRepository: string;

    @IsString()
    headRepository: string;

    @IsString()
    authorUsername: string;

    @IsString()
    authorAvatar: string;

    @IsBoolean()
    isDraft: boolean;

    @IsArray()
    labels: string[];

    @IsArray()
    reviewers: string[];

    @ValidateNested()
    @Type(() => StatsDTO)
    stats: StatsDTO;

    @IsBoolean()
    mergeable: boolean;

    @IsDateString()
    createdAt: string;

    @IsDateString()
    updatedAt: string;

    @IsOptional()
    @IsDateString()
    closedAt?: string;

    @IsOptional()
    @IsDateString()
    mergedAt?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CommitDTO)
    commits: CommitDTO[];
}