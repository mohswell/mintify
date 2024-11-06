import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { GenerativeModel } from '@google/generative-ai';
import { Inject } from '@nestjs/common';
import { GEMINI_PRO_MODEL, GEMINI_PRO_VISION_MODEL } from 'src/constants/gemini.constant';
import { createContent } from 'src/providers/content.helper';
import { AnalyzeImage } from 'src/types/AnalyzeImage';
import { GenAiResponse } from 'src/types/GenAiResponse';

@Injectable()
export class GeminiService {
    private readonly logger = new Logger(GeminiService.name);

    constructor(
        @Inject(GEMINI_PRO_MODEL) private readonly proModel: GenerativeModel,
        @Inject(GEMINI_PRO_VISION_MODEL) private readonly proVisionModel: GenerativeModel,
    ) {
        // Logging available methods on initialization
        this.logger.log(`Available methods on proModel: ${Object.keys(this.proModel)}`);
        this.logger.log(`Available methods on proVisionModel: ${Object.keys(this.proVisionModel)}`);
    }
    
    async generateText(prompt: string): Promise<GenAiResponse> {
        const contents = createContent(prompt);

        // Check if countTokens is available, otherwise use a mock function
        const tokenCountFunction = this.proModel.countTokens ? 
                                   this.proModel.countTokens.bind(this.proModel) : 
                                   this.mockCountTokens.bind(this);
        
        try {
            const { totalTokens } = await tokenCountFunction({ contents });
            const result = await this.proModel.generateContent({ contents });
            const response = await result.response;
            const text = response.text();

            return { totalTokens, text };
        } catch (err) {
            this.logger.error("Error in generateText:", err);
            throw new InternalServerErrorException(err.message, err.stack);
        }
    }

    async generateTextFromMultiModal(prompt: string, file: Express.Multer.File): Promise<GenAiResponse> {
        try {
            const contents = createContent(prompt, file);
            const tokenCountFunction = this.proVisionModel.countTokens ? 
                                       this.proVisionModel.countTokens.bind(this.proVisionModel) : 
                                       this.mockCountTokens.bind(this);

            const { totalTokens } = await tokenCountFunction({ contents });
            const result = await this.proVisionModel.generateContent({ contents });
            const response = await result.response;
            const text = response.text();

            return { totalTokens, text };
        } catch (err) {
            this.logger.error("Error in generateTextFromMultiModal:", err);
            throw new InternalServerErrorException(err.message, err.stack);
        }
    }

    async analyzeImages({ prompt, firstImage, secondImage }: AnalyzeImage): Promise<GenAiResponse> {
        try {
            const contents = createContent(prompt, firstImage, secondImage);
            const tokenCountFunction = this.proVisionModel.countTokens ? 
                                       this.proVisionModel.countTokens.bind(this.proVisionModel) : 
                                       this.mockCountTokens.bind(this);

            const { totalTokens } = await tokenCountFunction({ contents });
            const result = await this.proVisionModel.generateContent({ contents });
            const response = await result.response;
            const text = response.text();

            return { totalTokens, text };
        } catch (err) {
            this.logger.error("Error in analyzeImages:", err);
            throw new InternalServerErrorException(err.message, err.stack);
        }
    }

    // Mock token counter as a private method so it has access to `this.logger`
    private mockCountTokens({ contents }): { totalTokens: number } {
        this.logger.warn("Using mockCountTokens as countTokens is unavailable");
        const tokenCount = contents.split(" ").length; // Simple token count by words
        return { totalTokens: tokenCount };
    }
}
