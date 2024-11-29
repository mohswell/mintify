import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '~factories';
import { FileProvider } from '../application/providers/file.provider';

@Injectable()
export class FileAnalysisService {
  private readonly logger = new Logger(FileAnalysisService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Method to store file analysis from workflow
  async storeFileAnalysis(analysisData: {
    prNumber: number;
    filePath: string;
    additions: number;
    deletions: number;
    rawDiff?: string;
    //fileType?: string;
    aiAnalysisResult?: string;
    complexityScore?: number;
    securityIssues?: number;
    performanceIssues?: number;
  }) {
    try {
      // Find the associated pull request
      const pullRequest = await this.prisma.pullRequest.findUnique({
        where: { prNumber: analysisData.prNumber },
      });

      if (!pullRequest) {
        throw new Error(`Pull Request with number ${analysisData.prNumber} not found`);
      }

      const fileType = FileProvider.determineFileType(analysisData.filePath);
      // Optional: Perform additional logic for code files
      // const isCodeFile = FileProvider.isCodeFile(fileType);
      // const fileExt = analysisData.filePath.split('.').pop()?.toLowerCase();

      // Create file analysis record
      return await this.prisma.fileAnalysis.create({
        data: {
          prNumber: analysisData.prNumber,
          filePath: analysisData.filePath,
          fileType, // Use the determined file type directly
          additions: Math.max(analysisData.additions, 0),
          deletions: Math.max(analysisData.deletions, 0),
          totalChanges: Math.max(analysisData.additions + analysisData.deletions, 0),
          rawDiff: analysisData.rawDiff || null,
          complexityScore: analysisData.complexityScore ?? null,
          securityIssues: Math.max(analysisData.securityIssues || 0, 0),
          performanceIssues: Math.max(analysisData.performanceIssues || 0, 0),
          pullRequestId: pullRequest.id,
          analyzedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error('Error storing file analysis', error);
      throw error;
    }
  }

  // Method to retrieve file analyses for a PR
  async getFileAnalysesByPrNumber(prNumber: number) {
    return this.prisma.fileAnalysis.findMany({
      where: { prNumber },
      orderBy: { analyzedAt: 'desc' },
      include: {
        pullRequest: {
          select: {
            title: true,
            url: true,
            author: true,
            createdAt: true,
          },
        },
      },
    });
  }

  // Method to retrieve file analysis for all PR's for the user
  async getFileAnalysisByUserId(userId: bigint) {
    return this.prisma.execute(async (prisma) => {
      return prisma.fileAnalysis.findMany({
        where: {
          pullRequest: {
            userId: userId,
          },
        },
        select: {
          id: true,
          filePath: true,
          fileType: true,
          status: true,
          rawDiff: true,
          additions: true,
          deletions: true,
          totalChanges: true,
          aiAnalysisStatus: true,
          aiAnalysisResult: true,
          complexityScore: true,
          securityIssues: true,
          performanceIssues: true,
          analyzedAt: true,
        },
        orderBy: [{ analyzedAt: 'desc' }, { createdAt: 'desc' }],
        take: 100, // Limit to most recent 100 file analyses
      });
    });
  }
}
