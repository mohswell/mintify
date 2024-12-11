import { Logger } from '@nestjs/common';

export class ResponseFormatter {
  private static readonly logger = new Logger(ResponseFormatter.name);

  static formatTestResponse(testText: string): string {
    try {
      const formattedTests = testText.trim().startsWith('```') ? testText : `\`\`\`typescript\n${testText}\n\`\`\``;

      return `# 🧪 AI Generated Test Suite

${formattedTests}

---
*Generated by Mintify*`;
    } catch (error) {
      this.logger.error('Error formatting test response:', error);
      return testText;
    }
  }

  static validateTestSuite(testText: string): boolean {
    const requiredSections = ['Test Suite Overview', 'Unit Tests', 'Edge Cases', 'Test Coverage Considerations'];

    return requiredSections.every((section) => testText.includes(section));
  }
}