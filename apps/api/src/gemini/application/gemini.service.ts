import { GenerativeModel } from '@google/generative-ai';
import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { GenAiResponse } from '~gemini/domain/interface/response.interface';
import { createContent } from './helpers/content.helper';
import { GEMINI_PRO_MODEL, GEMINI_PRO_VISION_MODEL } from './gemini.constant';
import { AnalyzeImage } from '~gemini/domain/interface/analyze-images.interface';
import { ContentFormatterService } from './helpers/content.formatter';
import { TestFormatterService } from './helpers/test-formatter.helper';
//import { TestExtensionService } from '~gemini/traits/extensions/extensions.service';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  constructor(
    @Inject(GEMINI_PRO_MODEL) private readonly proModel: GenerativeModel,
    @Inject(GEMINI_PRO_VISION_MODEL) private readonly proVisionModel: GenerativeModel,
    private readonly contentFormatter: ContentFormatterService,
    private readonly testFormatter: TestFormatterService,
    //private readonly testExtensionService: TestExtensionService,
  ) {}

  async generateText(prompt: string): Promise<GenAiResponse> {
    return this.withRetry(async () => {
      const contents = createContent(prompt);
      const { totalTokens } = await this.proModel.countTokens({ contents });
      this.logger.log(`Tokens: ${JSON.stringify(totalTokens)}`);

      const result = await this.proModel.generateContent({ contents });
      const response = await result.response;
      const text = response.text();

      this.logger.log(JSON.stringify(text));
      return { totalTokens, text };
    });
  }

  async generateTextFromMultiModal(prompt: string, file: Express.Multer.File): Promise<GenAiResponse> {
    return this.withRetry(async () => {
      const contents = createContent(prompt, file);
      const { totalTokens } = await this.proVisionModel.countTokens({ contents });
      this.logger.log(`Tokens: ${JSON.stringify(totalTokens)}`);

      const result = await this.proVisionModel.generateContent({ contents });
      const response = await result.response;
      const text = response.text();

      this.logger.log(JSON.stringify(text));
      return { totalTokens, text };
    });
  }

  async analyzeImages({ prompt, firstImage, secondImage }: AnalyzeImage): Promise<GenAiResponse> {
    return this.withRetry(async () => {
      const contents = createContent(prompt, firstImage, secondImage);
      const { totalTokens } = await this.proVisionModel.countTokens({ contents });
      this.logger.log(`Tokens: ${JSON.stringify(totalTokens)}`);

      const result = await this.proVisionModel.generateContent({ contents });
      const response = await result.response;
      const text = response.text();

      this.logger.log(JSON.stringify(text));
      return { totalTokens, text };
    });
  }

  // TODO: Implement the analyzeCode method TO return the GenAIResponse Type
  async analyzeCode(code: string): Promise<any> {
    return this.withRetry(async () => {
      const contents = this.contentFormatter.createContent(code);
      const { totalTokens } = await this.proModel.countTokens({ contents });
      this.logger.debug(`Token count for analysis: ${totalTokens}`);

      const result = await this.proModel.generateContent({ contents });
      const response = await result.response;
      const text = response.text();

      const formattedResponse = this.contentFormatter.formatResponse(text);
      this.logger.debug('Analysis completed successfully');

      return {
        //totalTokens,
        formattedResponse,
      };
    });
  }

  async generateCode(code: string): Promise<GenAiResponse> {
    return this.withRetry(async () => {
      const { totalTokens } = await this.proModel.countTokens(code);
      this.logger.debug(`Token count for generation: ${totalTokens}`);

      const result = await this.proModel.generateContent(code);
      const response = await result.response;
      const rawText = await response.text();

      // Minimal formatting compared to analyzeCode
      const simplifiedResponse = this.contentFormatter.formatResponse(rawText);
      this.logger.debug('Content generation completed successfully');

      return {
        totalTokens,
        text: simplifiedResponse,
      };
    });
  }

  // async generateTests(code: string): Promise<GenAiResponse> { //TODO: change the return type to GenAiResponse later to add types
  async generateTests(code: string): Promise<any> {
    return this.withRetry(async () => {
      const contents = this.testFormatter.createContent(code);
      const { totalTokens } = await this.proModel.countTokens({ contents });
      this.logger.debug(`Token count for test generation: ${totalTokens}`);

      const result = await this.proModel.generateContent({ contents });
      const response = await result.response;
      const text = response.text();

      const formattedResponse = this.testFormatter.formatResponse(text);
      this.logger.debug('Test generation completed successfully');

      return {
        //totalTokens,
        formattedResponse,
      };
    });
  }

  private async withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          this.logger.error(`Failed after ${maxRetries} attempts:`, error);
          throw error;
        }

        // Check if it's a rate limit or temporary error
        if (
          error instanceof Error &&
          (error.message.includes('temporarily unavailable') || error.message.includes('rate limit'))
        ) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          this.logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }
    throw new Error('Max retries reached');
  }
}
