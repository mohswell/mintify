import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BaseController } from '~decorators/version.decorator';
import { PullRequestDTO, PullRequestResponseDTO } from '~dto';
import { GithubService } from '../application/github/github.service';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileAnalysisService } from '../sanctum/analysis.service';

@ApiTags('github')
@BaseController('github')
@UseInterceptors(ClassSerializerInterceptor)
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
    private readonly fileAnalysisService: FileAnalysisService,
    private readonly logger: Logger,
  ) {}

  @Post('store-data')
  async storeData(@Req() req: any, @Body() prMetadata: any) {
    this.logger.log('Received GitHub webhook data');
    this.logger.log('Raw Request Body:', JSON.stringify(req.body, null, 2));
    this.logger.log('Processed Metadata:', JSON.stringify(prMetadata, null, 2));

    try {
      const user = req.user;
      if (!user) {
        this.logger.error('No user information found in request');
        throw new HttpException('User information not found in request.', HttpStatus.UNAUTHORIZED);
      }

      // Parse and validate prNumber
      const rawPrNumber = prMetadata.prNumber || req.body.prNumber;
      if (!rawPrNumber) {
        throw new HttpException('Pull Request number is required', HttpStatus.BAD_REQUEST);
      }

      // Ensure prNumber is numeric
      const prNumber = Number(rawPrNumber);
      if (isNaN(prNumber) || prNumber <= 0) {
        throw new HttpException('Pull Request number must be a valid positive integer', HttpStatus.BAD_REQUEST);
      }

      // Update the cleanedMetadata to ensure prNumber is a number
      const cleanedMetadata = {
        ...prMetadata,
        prNumber,
        closedAt: prMetadata.closedAt === 'null' ? null : prMetadata.closedAt,
        mergedAt: prMetadata.mergedAt === 'null' ? null : prMetadata.mergedAt,
        description: prMetadata.description === 'null' ? null : prMetadata.description,
        authorAvatar: prMetadata.authorAvatar?.replace(/;$/, ''),
        prUrl: prMetadata.prUrl?.replace(/;$/, ''),
        labels: prMetadata.labels || [],
        reviewers: prMetadata.reviewers || [],
      };

      const result = await this.githubService.storePullRequestData(cleanedMetadata, user.id);

      this.logger.log('Successfully stored PR data', {
        prNumber: result.prNumber,
        prId: result.id,
      });

      return {
        message: 'Pull Request data stored successfully.',
        data: result,
      };
    } catch (error) {
      this.logger.error('Error in storeData', {
        error: (error as any).message,
        stack: (error as any).stack,
      });

      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to store Pull Request data.',
          details: (error as any).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('pull-requests')
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Optional user ID to fetch pull requests for a specific user',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of pull requests for the authenticated user',
    type: [PullRequestResponseDTO],
  })
  async getPullRequests(@Req() req, @Query('userId') userIdParam?: string): Promise<PullRequestResponseDTO[]> {
    const userId = userIdParam ? BigInt(userIdParam) : req.user.id;

    if (!userId) {
      throw new BadRequestException('User ID is missing in the request');
    }

    try {
      return await this.githubService.getPullRequestsForUser(userId);
    } catch (error) {
      throw new NotFoundException('Could not fetch pull requests');
    }
  }

  @Post('store-file-analysis')
  async storeFileAnalysis(@Body() fileAnalysisData: any) {
    try {
      // Parse and validate prNumber
      const rawPrNumber = fileAnalysisData.prNumber;
      if (!rawPrNumber) {
        throw new HttpException('Pull Request number is required', HttpStatus.BAD_REQUEST);
      }

      // Ensure prNumber is numeric
      const prNumber = Number(rawPrNumber);
      if (isNaN(prNumber) || prNumber <= 0) {
        this.logger.error(`Invalid PR number provided: ${rawPrNumber}`);
        throw new HttpException('Pull Request number must be a valid positive integer', HttpStatus.BAD_REQUEST);
      }

      // Validate other required fields
      if (!fileAnalysisData.filePath) {
        this.logger.error('No file path provided in request');
        throw new HttpException('File path is required', HttpStatus.BAD_REQUEST);
      }

      // Parse and validate additions and deletions
      const additions = Number(fileAnalysisData.additions);
      const deletions = Number(fileAnalysisData.deletions);

      if (isNaN(additions) || isNaN(deletions)) {
        this.logger.error(
          `Invalid additions or deletions: additions=${fileAnalysisData.additions}, deletions=${fileAnalysisData.deletions}`,
        );
        throw new HttpException('Additions and deletions must be valid numbers', HttpStatus.BAD_REQUEST);
      }

      // Create cleaned data object with proper number types
      const cleanedData = {
        prNumber,
        filePath: fileAnalysisData.filePath,
        additions,
        deletions,
        rawDiff: fileAnalysisData.rawDiff,
        //fileType: fileAnalysisData.fileType  // auto calculated by the file service
      };

      const result = await this.fileAnalysisService.storeFileAnalysis(cleanedData);

      return {
        message: 'File analysis stored successfully.',
        data: result,
      };
    } catch (error) {
      this.logger.error('Error storing file analysis:', error);

      if (error instanceof HttpException) {
        throw error; // Re-throw HTTP exceptions as-is
      }

      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to store file analysis.',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('file-analysis')
  @ApiResponse({
    status: 200,
    description: 'List of all file analyses for the authenticated user',
  })
  async getAllFileAnalyses(@Req() req) {
    try {
      // Validate user ID exists and is the correct type
      const userId = BigInt(req.user.id);
      if (!userId) {
        throw new BadRequestException('User ID is missing in the request');
      }
      this.logger.log(`Fetching file analyses for user ID: ${userId}`);

      const analysis = await this.fileAnalysisService.getFileAnalysisByUserId(userId);

      if (!analysis) {
        return {
          message: 'No file analyses found',
          data: [],
        };
      }

      return {
        message: 'File analysis retrieved successfully',
        data: analysis,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve file analyses.',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('file-analysis/:prNumber')
  @ApiResponse({
    status: 200,
    description: 'List of file analyses for a specific PR',
  })
  async getFileAnalyses(@Param('prNumber') prNumber: string) {
    try {
      const parsedPrNumber = parseInt(prNumber, 10);
      if (isNaN(parsedPrNumber)) {
        throw new BadRequestException('PR number must be a valid number');
      }

      const analyses = await this.fileAnalysisService.getFileAnalysesByPrNumber(parsedPrNumber);
      return {
        message: 'File analyses retrieved successfully',
        data: analyses,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve file analyses.',
          details: (error as any).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
