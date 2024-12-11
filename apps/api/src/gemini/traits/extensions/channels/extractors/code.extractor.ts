import { Logger } from '@nestjs/common';

export class CodeExtractor {
  private static readonly logger = new Logger(CodeExtractor.name);

  static extractFromMarkdown(text: string): string {
    try {
      const codePatterns = [/```(?:typescript|js|javascript)?\n([\s\S]*?)```/, /```\n([\s\S]*?)```/, /([\s\S]*)/];

      for (const pattern of codePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }

      return text.trim();
    } catch (error) {
      this.logger.error('Error extracting code from markdown:', error);
      return text;
    }
  }
}
