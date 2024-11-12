import { Injectable, Logger } from '@nestjs/common';
import { Content, Part } from '@google/generative-ai';

@Injectable()
export class ContentFormatterService {
  private readonly logger = new Logger(ContentFormatterService.name);

  createContent(text: string, ...images: Express.Multer.File[]): Content[] {
    const imageParts: Part[] = images.map((image) => {
      return {
        inlineData: {
          mimeType: image.mimetype,
          data: image.buffer.toString('base64'),
        },
      };
    });

    return [
      {
        role: 'user',
        parts: [
          ...imageParts,
          {
            text: this.formatAnalysisPrompt(text),
          },
        ],
      },
    ];
  }

  private formatAnalysisPrompt(code: string): string {
    // Extract code from markdown if present
    const codeContent = this.extractCodeFromMarkdown(code);
    
    return `As an expert code reviewer, please analyze the following code changes and provide a detailed review:

CHANGES TO ANALYZE:
${codeContent}

Please provide your analysis in the following format:

## Summary of Changes
[Provide a brief overview of the main changes]

## Potential Issues
- [List any potential bugs, security concerns, or performance issues]
- [Include severity level for each issue]

## Improvement Suggestions
- [Provide specific recommendations for improvement]
- [Include code examples where relevant]

## Best Practices
- [Highlight areas where best practices could be applied]
- [Suggest specific improvements]

## Security Considerations
- [Identify any security implications]
- [Provide security-focused recommendations]

Please be specific and provide examples where possible.`;
  }

  private extractCodeFromMarkdown(text: string): string {
    try {
      // Check if the text contains a markdown diff block
      const diffRegex = /```diff\n([\s\S]*?)```/g;
      const matches = [...text.matchAll(diffRegex)];

      if (matches.length > 0) {
        // Extract and format all diff blocks
        return matches
          .map(match => {
            const diffContent = match[1].trim();
            // Add some context about added/removed lines
            return diffContent.split('\n')
              .map(line => {
                if (line.startsWith('+')) return `ADDED: ${line.substring(1)}`;
                if (line.startsWith('-')) return `REMOVED: ${line.substring(1)}`;
                return line;
              })
              .join('\n');
          })
          .join('\n\n=== Next File ===\n\n');
      }

      // Check for regular code blocks
      const codeRegex = /```[\w]*\n([\s\S]*?)```/g;
      const codeMatches = [...text.matchAll(codeRegex)];
      
      if (codeMatches.length > 0) {
        return codeMatches
          .map(match => match[1].trim())
          .join('\n\n=== Next Block ===\n\n');
      }

      // If no markdown formatting found, return the original text
      return text;
    } catch (error) {
      this.logger.error('Error extracting code from markdown:', error);
      return text;
    }
  }

  formatResponse(analysisText: string): string {
    try {
      return `# Code Review Analysis

${analysisText}

---
*Analysis generated by AI Code Review*`;
    } catch (error) {
      this.logger.error('Error formatting response:', error);
      return analysisText;
    }
  }
}