import { GenerativeModel } from '@google/generative-ai';
import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { GenAiResponse } from '~gemini/domain/interface/response.interface';
import { createContent } from './helpers/content.helper';
import { GEMINI_PRO_MODEL, GEMINI_PRO_VISION_MODEL } from './gemini.constant';
import { AnalyzeImage } from '~gemini/domain/interface/analyze-images.interface';
import { ContentFormatterService } from './helpers/content.formatter';
import { TestFormatterService } from './helpers/test-formatter.helper';
@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  constructor(
    @Inject(GEMINI_PRO_MODEL) private readonly proModel: GenerativeModel,
    @Inject(GEMINI_PRO_VISION_MODEL) private readonly proVisionModel: GenerativeModel,
    private readonly contentFormatter: ContentFormatterService,
    private readonly testFormatter: TestFormatterService,
  ) {}

  async generateText(prompt: string): Promise<GenAiResponse> {
    const contents = createContent(prompt);

    const { totalTokens } = await this.proModel.countTokens({ contents });
    this.logger.log(`Tokens: ${JSON.stringify(totalTokens)}`);

    const result = await this.proModel.generateContent({ contents });
    const response = await result.response;
    const text = response.text();

    this.logger.log(JSON.stringify(text));
    return { totalTokens, text };
  }

  async generateTextFromMultiModal(prompt: string, file: Express.Multer.File): Promise<GenAiResponse> {
    try {
      const contents = createContent(prompt, file);

      const { totalTokens } = await this.proVisionModel.countTokens({ contents });
      this.logger.log(`Tokens: ${JSON.stringify(totalTokens)}`);

      const result = await this.proVisionModel.generateContent({ contents });
      const response = await result.response;
      const text = response.text();

      this.logger.log(JSON.stringify(text));
      return { totalTokens, text };
    } catch (err) {
      if (err instanceof Error) {
        throw new InternalServerErrorException(err.message, err.stack);
      }
      throw err;
    }
  }

  async analyzeImages({ prompt, firstImage, secondImage }: AnalyzeImage): Promise<GenAiResponse> {
    try {
      const contents = createContent(prompt, firstImage, secondImage);

      const { totalTokens } = await this.proVisionModel.countTokens({ contents });
      this.logger.log(`Tokens: ${JSON.stringify(totalTokens)}`);

      const result = await this.proVisionModel.generateContent({ contents });
      const response = await result.response;
      const text = response.text();

      this.logger.log(JSON.stringify(text));
      return { totalTokens, text };
    } catch (err) {
      if (err instanceof Error) {
        throw new InternalServerErrorException(err.message, err.stack);
      }
      throw err;
    }
  }
  async analyzeCode(code: string): Promise<GenAiResponse> {
    try {
      // Create formatted content using the formatter service
      const contents = this.contentFormatter.createContent(code);

      // Count tokens
      const { totalTokens } = await this.proModel.countTokens({ contents });
      this.logger.debug(`Token count for analysis: ${totalTokens}`);

      // Generate the analysis
      const result = await this.proModel.generateContent({ contents });
      const response = await result.response;
      const text = response.text();

      // Format the response
      const formattedResponse = this.contentFormatter.formatResponse(text);

      this.logger.debug('Analysis completed successfully');
      
      return {
        totalTokens,
        text: formattedResponse,
      };
    } catch (error) {
      this.logger.error('Error during code analysis:', error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          'Failed to analyze code',
          error.stack,
        );
      }
      throw error;
    }
  }

  async generateTests(code: string): Promise<GenAiResponse> {
    try {
      // Create formatted content using the test formatter service
      const contents = this.testFormatter.createContent(code);
  
      // Count tokens
      const { totalTokens } = await this.proModel.countTokens({ contents });
      this.logger.debug(`Token count for test generation: ${totalTokens}`);
  
      // Generate the tests
      const result = await this.proModel.generateContent({ contents });
      const response = await result.response;
      const text = response.text();
  
      // Format the response
      const formattedResponse = this.testFormatter.formatResponse(text);
  
      this.logger.debug('Test generation completed successfully');
      
      return {
        totalTokens,
        text: formattedResponse,
      };
    } catch (error) {
      this.logger.error('Error during test generation:', error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          'Failed to generate tests',
          error.stack,
        );
      }
      throw error;
    }
  }
}