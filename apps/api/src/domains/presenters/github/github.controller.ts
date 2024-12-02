import { BadRequestException, Body, ClassSerializerInterceptor, Get, HttpException, HttpStatus, Logger, NotFoundException, Param, Post, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
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
    ) { }

    @Post('store-data')
    async storeData(@Req() req: any, @Body() prMetadata: any) {
        console.log('Received request:', req.body);
        console.log('Cleaned Metadata:', prMetadata);

        try {
            const user = req.user;
            if (!user) {
                throw new HttpException(
                    'User information not found in request.',
                    HttpStatus.UNAUTHORIZED,
                );
            }

            console.log('User ID:', user.id);
            const userId = user.id;

            if (!prMetadata.prNumber) {
                throw new HttpException(
                    'Pull Request number is required',
                    HttpStatus.BAD_REQUEST
                );
            }

            const cleanedMetadata = {
                ...prMetadata,
                prNumber: prMetadata.prNumber || 1,
                closedAt: prMetadata.closedAt === 'null' ? null : prMetadata.closedAt,
                mergedAt: prMetadata.mergedAt === 'null' ? null : prMetadata.mergedAt,
                description: prMetadata.description === 'null' ? null : prMetadata.description,
                authorAvatar: prMetadata.authorAvatar?.replace(/;$/, ''),
                prUrl: prMetadata.prUrl?.replace(/;$/, ''),
                labels: prMetadata.labels || [],
                reviewers: prMetadata.reviewers || [],
            };

            if (!cleanedMetadata.prNumber) {
                console.error('prNumber is missing in metadata:', prMetadata);
                throw new HttpException('Pull Request number is required', HttpStatus.BAD_REQUEST);
            }

            console.log('Processed Metadata:', cleanedMetadata);

            const result = await this.githubService.storePullRequestData(cleanedMetadata, userId);
            return {
                message: 'Pull Request data stored successfully.',
                data: result,
            };
        } catch (error) {
            this.logger.error('Error in storeData:', error);
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
        type: [PullRequestResponseDTO]
    })
    async getPullRequests(
        @Req() req,
        @Query('userId') userIdParam?: string,
    ): Promise<PullRequestResponseDTO[]> {
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
            // Validate input for required fields
            if (!fileAnalysisData.prNumber || !fileAnalysisData.filePath) {
                throw new BadRequestException('PR Number and File path are required');
            }

            if (typeof fileAnalysisData.additions !== 'number' || typeof fileAnalysisData.deletions !== 'number') {
                throw new BadRequestException('Additions and deletions must be numbers');
            }

            const result = await this.fileAnalysisService.storeFileAnalysis({
                prNumber: fileAnalysisData.prNumber,
                filePath: fileAnalysisData.filePath,
                additions: fileAnalysisData.additions || 0,
                deletions: fileAnalysisData.deletions || 0,
                rawDiff: fileAnalysisData.rawDiff,
                //fileType: fileAnalysisData.fileType  // auto calculated by the file service
            });

            return {
                message: 'File analysis stored successfully.',
                data: result
            };
        } catch (error) {
            console.error('Error storing file analysis:', error);
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: 'Failed to store file analysis.',
                    details: (error as any).message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('file-analysis')
    @ApiResponse({
        status: 200,
        description: 'List of all file analyses for the authenticated user'
    })
    async getAllFileAnalyses(@Req() req) {
        try {
            const userId = req.user.id;
            if (!userId) {
                throw new BadRequestException('User ID is missing in the request');
            }

            const analysis = await this.fileAnalysisService.getFileAnalysisByUserId(userId);
            return {
                message: 'File analysis retrieved successfully',
                data: analysis
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

    @Get('file-analysis/:prNumber')
    @ApiResponse({
        status: 200,
        description: 'List of file analyses for a specific PR'
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
                data: analyses
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