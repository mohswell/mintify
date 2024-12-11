import { Injectable, Logger } from '@nestjs/common';
import { Content } from '@google/generative-ai';
import { CodeExtractor } from './channels/extractors/code.extractor';
import { CodeAnalyzer } from './channels/stubs/code-analyzer.util';
import { ResponseFormatter } from './channels/stubs/response-formatter.util';
import { PromptBuilder } from './channels/vault/prompt.builder';
import { TestStrategyGenerator } from './channels/vault/test.strategy';
import { TestGenerationConfig } from './presenters/test-generation.interface';

@Injectable()
export class TestExtensionService {
  private readonly logger = new Logger(TestExtensionService.name);
  private readonly defaultConfig: TestGenerationConfig = {
    framework: 'jest',
    language: 'typescript',
    includeIntegrationTests: true,
    coverageThreshold: 80,
  };

  createContent(code: string, config: Partial<TestGenerationConfig> = {}): Content[] {
    try {
      const mergedConfig = { ...this.defaultConfig, ...config };
      const extractedCode = CodeExtractor.extractFromMarkdown(code);

      // Perform deep code analysis
      const analysis = CodeAnalyzer.analyzeCode(extractedCode);

      // Generate test and mock strategies based on analysis
      const { testStrategy, mockStrategy } = TestStrategyGenerator.generateStrategy(analysis);

      // Build enhanced prompt with analysis insights
      const prompt = PromptBuilder.buildTestGenerationPrompt(extractedCode, analysis, testStrategy, mockStrategy);

      return [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ];
    } catch (error) {
      this.logger.error('Error creating test content:', error);
      throw error;
    }
  }

  formatResponse(testText: string): string {
    try {
      if (!ResponseFormatter.validateTestSuite(testText)) {
        this.logger.warn('Generated test suite might be incomplete');
      }
      return ResponseFormatter.formatTestResponse(testText);
    } catch (error) {
      this.logger.error('Error in test response formatting:', error);
      return testText;
    }
  }
}
