import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '~factories';

@Injectable()
export class FileAnalysisService {
  private readonly logger = new Logger(FileAnalysisService.name);

  constructor(
    private readonly prisma: PrismaService
  ) {}

  // Method to store file analysis from workflow
  async storeFileAnalysis(
    analysisData: {
      prNumber: number;
      filePath: string;
      additions: number;
      deletions: number;
      rawDiff?: string;
      fileType?: string;
    }
  ) {
    try {
      // Find the associated pull request
      const pullRequest = await this.prisma.pullRequest.findUnique({
        where: { prNumber: analysisData.prNumber }
      });

      if (!pullRequest) {
        throw new Error(`Pull Request with number ${analysisData.prNumber} not found`);
      }

      // Perform AI analysis if it's a code file
      // let aiAnalysis = null;
      // const codeFileTypes = ['js', 'ts', 'yml', 'yaml', 'md', 'java', 'py', 'tsx', 'css', 'sh', 'json'];
      // const fileExt = analysisData.filePath.split('.').pop()?.toLowerCase();
      
      // if (fileExt && codeFileTypes.includes(fileExt)) {
      //   try {
      //     const aiResult = await this.geminiService.analyzeCode(analysisData.rawDiff || '');
      //     aiAnalysis = aiResult.text;
      //   } catch (aiError) {
      //     this.logger.error('AI analysis failed', aiError);
      //   }
      // }

      // Create file analysis record
      return await this.prisma.fileAnalysis.create({
        data: {
          prNumber: analysisData.prNumber,
          filePath: analysisData.filePath,
          fileType: analysisData.fileType || fileExt || 'unknown',
          additions: analysisData.additions,
          deletions: analysisData.deletions,
          rawDiff: analysisData.rawDiff,
          aiAnalysis: aiAnalysis,
          pullRequestId: pullRequest.id
        }
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
      orderBy: { analyzedAt: 'desc' }
    });
  }
}