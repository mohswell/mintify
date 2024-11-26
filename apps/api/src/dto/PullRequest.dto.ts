import { ApiProperty } from '@nestjs/swagger';

class CommitResponseDTO {
  @ApiProperty()
  id: bigint;

  @ApiProperty()
  commitHash: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  authorName: string;

  @ApiProperty()
  authorEmail: string;

  @ApiProperty()
  date: Date;

  @ApiProperty({ required: false })
  stats?: {
    additions: number;
    deletions: number;
    changedFiles: number;
  };
}

export class PullRequestResponseDTO {
  @ApiProperty()
  id: bigint;

  @ApiProperty()
  prNumber: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  author: string;

  @ApiProperty()
  authorUsername: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  baseBranch: string;

  @ApiProperty()
  headBranch: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  isDraft: boolean;

  @ApiProperty()
  labels: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: () => [CommitResponseDTO] })
  commits: CommitResponseDTO[];

  @ApiProperty()
  stats: {
    additions: number;
    deletions: number;
    changedFiles: number;
  };
}