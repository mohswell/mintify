import { Injectable, Logger } from '@nestjs/common';
import { Content, Part } from '@google/generative-ai';

@Injectable()
export class ContentFormatterService {
  private readonly logger = new Logger(ContentFormatterService.name);

  createContent(text: string, ...images: Express.Multer.File[]): Content[] {
    const imageParts: Part[] = images.map((image) => ({
      inlineData: {
        mimeType: image.mimetype,
        data: image.buffer.toString('base64'),
      },
    }));

    return [
      {
        role: 'user',
        parts: [
          ...imageParts,
          {
            text: this.formatCodeReviewPrompt(text),
          },
        ],
      },
    ];
  }

  private formatCodeReviewPrompt(text: string): string {
    const codeChanges = this.extractCodeChanges(text);

    return `Review the following code changes thoroughly and provide an analysis adhering to the guidelines below if applicable else skip the section not relevant to the code changes.:
1. Code structure and architecture
2. Potential refactoring opportunities
3. Performance and efficiency
4. Security vulnerabilities
5. Dependency and import management

CHANGES TO ANALYZE:
${codeChanges}

REVIEW GUIDELINES:
- Prioritize code changes over lengthy explanations
- Focus on actionable improvements
- Identify potential risks and optimization opportunities
- Suggest specific refactoring strategies

ANALYSIS FORMAT:
## Key Changes
- Brief overview of main modifications

## Code Structure Analysis
- Architectural observations
- Refactoring recommendations

## Performance Insights
- Efficiency improvements
- Bottlenecks to address

## Security Checkpoint
- Security concerns
- Risk mitigation strategies

## Dependency Review
- Import and package management
- Optimization suggestions

Provide a concise and actionable review while considering how the changes impact the existing application.`;
  }

  private extractCodeChanges(text: string): string {
    try {
      // Enhanced extraction with multiple strategies
      const extractionStrategies = [
        // Diff block extraction (most preferred)
        () => {
          const diffRegex = /```diff\n([\s\S]*?)```/g;
          const matches = [...text.matchAll(diffRegex)];
          return matches.length > 0
            ? matches.map(match =>
              match[1].split('\n')
                .filter(line => line.startsWith('+') || line.startsWith('-'))
                .map(line => line.startsWith('+')
                  ? `[ADDED] ${line.substring(1).trim()}`
                  : `[REMOVED] ${line.substring(1).trim()}`)
                .join('\n')
            ).join('\n\n')
            : null;
        },

        // Code block extraction (fallback)
        () => {
          const codeRegex = /```[\w]*\n([\s\S]*?)```/g;
          const matches = [...text.matchAll(codeRegex)];
          return matches.length > 0
            ? matches.map(match => match[1].trim()).join('\n\n=== Next Block ===\n\n')
            : null;
        },

        // Plain text fallback
        () => text.trim()
      ];

      for (const strategy of extractionStrategies) {
        const result = strategy();
        if (result) return result;
      }

      return 'No extractable code changes found.';
    } catch (error: any) {
      this.logger.error('Code extraction error:', error);
      return `Extraction failed: ${error.message}`;
    }
  }

  formatResponse(analysisText: string): string {
    try {
      return `# Focused Code Review Analysis

${analysisText}

---
*AI-Powered Code Review*`;
    } catch (error) {
      this.logger.error('Response formatting error:', error);
      return analysisText;
    }
  }

  // New method to validate and suggest import/package improvements
  validateImportStructure(imports: string[]): string[] {
    const suggestions: string[] = [];

    // Check for unused imports
    const unusedImports = imports.filter(imp =>
      !imp.includes('used') && !imp.includes('required')
    );
    if (unusedImports.length > 0) {
      suggestions.push('Remove unused imports to improve code cleanliness');
    }

    // Suggest import organization
    const importGroups = {
      external: imports.filter(imp => imp.includes('from') && !imp.includes('./') && !imp.includes('../')),
      internal: imports.filter(imp => imp.includes('./') || imp.includes('../')),
      typings: imports.filter(imp => imp.includes('type') || imp.includes('interface'))
    };

    // Suggest import sorting and grouping
    if (importGroups.external.length > 0) {
      suggestions.push('Consider organizing imports: external, internal, and type imports');
    }

    return suggestions;
  }

  simplifyResponse(responseText: string): string {
    // Perform only necessary processing, e.g., trimming, removing boilerplate, etc.
    return responseText.trim();
  }

}