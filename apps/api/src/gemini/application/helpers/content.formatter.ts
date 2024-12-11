import { Injectable, Logger } from '@nestjs/common';
import { Content, Part } from '@google/generative-ai';
import { createContent } from './content.helper';

interface CodeMetrics {
  complexity: number;
  linesOfCode: number;
  commentPercentage: number;
  maintainabilityIndex: number;
}

interface SecurityCheck {
  severity: 'low' | 'medium' | 'high';
  issue: string;
  suggestion: string;
}

interface AnalysisResult {
  metrics: CodeMetrics;
  securityIssues: SecurityCheck[];
  refactoringOpportunities: string[];
  testSuggestions: string[];
}

@Injectable()
export class ContentFormatterService {
  private readonly logger = new Logger(ContentFormatterService.name);

  private readonly securityPatterns = {
    sql: /(?:SELECT|INSERT|UPDATE|DELETE).*(?:FROM|INTO|WHERE)/i,
    xss: /innerHTML|outerHTML|document\.write/i,
    eval: /eval\(|Function\(.*\)/i,
    secrets: /(?:api[_-]?key|token|password|secret)[=:]/i,
    unsafeRegex: /(?:\.){2,}[\*\+]/,
  };

  private readonly complexityThresholds = {
    maxFunctionLength: 20,
    maxCyclomaticComplexity: 10,
    minCommentPercentage: 10,
    maxFileLength: 300,
  };

  createContent(text: string, ...images: Express.Multer.File[]): Content[] {
    const imageParts: Part[] = images.map((image) => ({
      inlineData: {
        mimeType: image.mimetype,
        data: image.buffer.toString('base64'),
      },
    }));

    const analysis = this.performDetailedAnalysis(text);
    const enhancedPrompt = this.createEnhancedPrompt(text, analysis);

    return [
      {
        role: 'user',
        parts: [
          ...imageParts,
          {
            text: enhancedPrompt,
          },
        ],
      },
    ];
  }

  private createEnhancedPrompt(text: string, analysis: AnalysisResult): string {
    const codeChanges = this.extractCodeChanges(text);
    const { metrics, securityIssues, refactoringOpportunities } = analysis;

    // Generate a focused, context-aware prompt
    return `Perform a targeted, high-impact code review focusing specifically on the code changes:
  
  CODE COMPLEXITY SNAPSHOT:
  - Cyclomatic Complexity: ${metrics.complexity} ${
    metrics.complexity > this.complexityThresholds.maxCyclomaticComplexity ? '⚠️ EXCESSIVE COMPLEXITY' : ''
  }
  - Code Volume: ${metrics.linesOfCode} lines
  - Comment Coverage: ${metrics.commentPercentage.toFixed(2)}%
  - Maintainability Index: ${metrics.maintainabilityIndex.toFixed(2)}
  
  ${this.formatSecurityIssues(securityIssues)}
  
  ${this.formatRefactoringOpportunities(refactoringOpportunities)}
  
  PRECISE CODE CHANGES:
  ${codeChanges}
  
  URGENT REVIEW FOCUS AREAS:
  
  1. Immediate Refactoring Targets
     - Identify specific code blocks with:
       * High cognitive complexity
       * Repeated logic patterns
       * Potential performance bottlenecks
     - Propose concrete refactoring strategies with exact line/block references
  
  2. Security Critical Review
     - Zero in on:
       * Input validation vulnerabilities
       * Potential injection points
       * Unhandled error scenarios
       * Authentication/authorization weak spots
     - Provide actionable mitigation strategies
  
  3. Performance Optimization
     - Analyze:
       * Algorithmic efficiency
       * Unnecessary computations
       * Resource-intensive operations
       * Potential memory leaks
     - Recommend precise optimization techniques
  
  4. Code Structure & Design
     - Evaluate:
       * SOLID principle violations
       * Tight coupling between components
       * Excessive dependencies
       * Lack of abstraction
     - Suggest architectural improvements
  
  5. Testability Enhancement
     - Identify:
       * Untestable code blocks
       * Missing edge case handling
       * Complex function signatures
     - Propose test strategy and structural changes
  
  DELIVERABLE:
  - Hyper-focused recommendations
  - Line-specific improvement suggestions
  - Prioritized action items
  - Minimum viable refactoring approach
  
  CRITICAL INSTRUCTION: 
- Provide code recommendations ONLY for areas directly affected by the code changes
- If a section (e.g., Performance, Security) is NOT applicable to the current changes, DO NOT mention it at all
- Focus exclusively on relevant, actionable improvements
- Be concise and precise, addressing only the specific modifications in the code
`;
  }

  private performDetailedAnalysis(text: string): AnalysisResult {
    const metrics = this.calculateCodeMetrics(text);
    const securityIssues = this.performSecurityCheck(text);
    const refactoringOpportunities = this.identifyRefactoringOpportunities(text);
    const testSuggestions = this.generateTestSuggestions(text);

    return {
      metrics,
      securityIssues,
      refactoringOpportunities,
      testSuggestions,
    };
  }

  private calculateCodeMetrics(code: string): CodeMetrics {
    const lines = code.split('\n');
    const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
    const commentLines = lines.filter((line) => line.trim().startsWith('//') || line.trim().match(/\/\*|\*\//));

    // Calculate cyclomatic complexity (simplified)
    const complexity = (code.match(/if|while|for|&&|\|\||case/g) || []).length + 1;

    // Calculate maintainability index (simplified version)
    const volume = nonEmptyLines.length * Math.log2(new Set(code.split(/\s+/).filter(Boolean)).size);
    const maintainabilityIndex = Math.max(
      0,
      ((171 - 5.2 * Math.log(volume) - 0.23 * complexity - 16.2 * Math.log(nonEmptyLines.length)) * 100) / 171,
    );

    return {
      complexity,
      linesOfCode: nonEmptyLines.length,
      commentPercentage: (commentLines.length / nonEmptyLines.length) * 100,
      maintainabilityIndex,
    };
  }

  private performSecurityCheck(code: string): SecurityCheck[] {
    const issues: SecurityCheck[] = [];

    // Check for security patterns
    Object.entries(this.securityPatterns).forEach(([type, pattern]) => {
      if (pattern.test(code)) {
        issues.push({
          severity: 'high',
          issue: `Potential ${type} vulnerability detected`,
          suggestion: this.getSecuritySuggestion(type),
        });
      }
    });

    // Check for other security concerns
    if (code.includes('http://')) {
      issues.push({
        severity: 'medium',
        issue: 'Non-secure HTTP protocol usage',
        suggestion: 'Use HTTPS instead of HTTP for secure communication',
      });
    }

    return issues;
  }

  private identifyRefactoringOpportunities(code: string): string[] {
    const opportunities: string[] = [];
    const lines = code.split('\n');

    // Check function length
    const functionMatches = code.match(/function.*?\{[\s\S]*?\}/g) || [];
    functionMatches.forEach((func) => {
      const funcLines = func.split('\n').length;
      if (funcLines > this.complexityThresholds.maxFunctionLength) {
        opportunities.push(`Consider breaking down function with ${funcLines} lines into smaller functions`);
      }
    });

    // Check for duplicate code blocks
    const codeBlocks = new Map<string, number>();
    for (let i = 0; i < lines.length - 3; i++) {
      const block = lines.slice(i, i + 4).join('\n');
      codeBlocks.set(block, (codeBlocks.get(block) || 0) + 1);
    }
    codeBlocks.forEach((count, block) => {
      if (count > 1) {
        opportunities.push('Duplicate code block detected - consider extracting to a shared function');
      }
    });

    return opportunities;
  }

  private generateTestSuggestions(code: string): string[] {
    const suggestions: string[] = [];

    // Identify testable functions
    const functionMatches = code.match(/function\s+(\w+)\s*\([^)]*\)/g) || [];
    functionMatches.forEach((func) => {
      const funcName = func.match(/function\s+(\w+)/)[1];
      suggestions.push(`Test ${funcName} with different input scenarios`);

      // Suggest edge cases based on function parameters
      const params = func.match(/\((.*?)\)/)[1];
      if (params) {
        suggestions.push(`Test ${funcName} with edge cases for parameters: ${params}`);
      }
    });

    return suggestions;
  }

  private getSecuritySuggestion(type: string): string {
    const suggestions = {
      sql: 'Use parameterized queries or an ORM to prevent SQL injection',
      xss: 'Use safe DOM manipulation methods or sanitize HTML content',
      eval: 'Avoid using eval() and Function constructor',
      secrets: 'Move sensitive data to environment variables',
      unsafeRegex: 'Review and optimize regex patterns for safety',
    };
    return suggestions[type] || 'Review and apply security best practices';
  }

  private formatSecurityIssues(issues: SecurityCheck[]): string {
    if (issues.length === 0) return 'SECURITY ANALYSIS: No immediate security concerns detected.';

    return `SECURITY CONCERNS:
${issues
  .map(
    (issue) => `- [${issue.severity.toUpperCase()}] ${issue.issue}
  Suggestion: ${issue.suggestion}`,
  )
  .join('\n')}`;
  }

  private formatRefactoringOpportunities(opportunities: string[]): string {
    if (opportunities.length === 0) return 'REFACTORING: No immediate refactoring needs identified.';

    return `REFACTORING OPPORTUNITIES:
${opportunities.map((opp) => `- ${opp}`).join('\n')}`;
  }

  private extractCodeChanges(text: string): string {
    try {
      const extractionStrategies = [
        // Enhanced diff block extraction
        () => {
          const diffRegex = /```diff\n([\s\S]*?)```/g;
          const matches = [...text.matchAll(diffRegex)];
          if (matches.length > 0) {
            return matches
              .map((match) => {
                const lines = match[1].split('\n');
                const changes = lines.filter((line) => line.startsWith('+') || line.startsWith('-'));
                return changes
                  .map((line) => {
                    const type = line.startsWith('+') ? 'ADDED' : 'REMOVED';
                    const code = line.substring(1).trim();
                    const impact = this.assessChangeImpact(code);
                    return `[${type}] ${code}\n  Impact: ${impact}`;
                  })
                  .join('\n');
              })
              .join('\n\n');
          }
          return null;
        },

        // Enhanced code block extraction
        () => {
          const codeRegex = /```[\w]*\n([\s\S]*?)```/g;
          const matches = [...text.matchAll(codeRegex)];
          if (matches.length > 0) {
            return matches
              .map((match) => {
                const code = match[1].trim();
                const metrics = this.calculateCodeMetrics(code);
                return `${code}\n\nMetrics:\n- Complexity: ${metrics.complexity}\n- Lines: ${metrics.linesOfCode}`;
              })
              .join('\n\n=== Next Block ===\n\n');
          }
          return null;
        },

        // Intelligent text analysis
        () => {
          const cleanText = text.trim();
          if (cleanText.length > 0) {
            const metrics = this.calculateCodeMetrics(cleanText);
            return `${cleanText}\n\nAutomatic Analysis:\n${JSON.stringify(metrics, null, 2)}`;
          }
          return null;
        },
      ];

      for (const strategy of extractionStrategies) {
        const result = strategy();
        if (result) return result;
      }

      return 'No analyzable code changes found.';
    } catch (error: any) {
      this.logger.error('Code extraction error:', error);
      return `Extraction failed: ${error.message}`;
    }
  }

  private assessChangeImpact(code: string): string {
    const impacts = [];

    if (code.includes('async') || code.includes('await')) {
      impacts.push('Asynchronous operation modification');
    }

    if (code.includes('export') || code.includes('import')) {
      impacts.push('Module dependency change');
    }

    if (code.includes('class') || code.includes('interface')) {
      impacts.push('Type definition modification');
    }

    if (code.includes('try') || code.includes('catch')) {
      impacts.push('Error handling modification');
    }

    return impacts.length > 0 ? impacts.join(', ') : 'Minor change';
  }

  formatResponse(analysisText: string): string {
    try {
      const enhancedAnalysis = this.enhanceAnalysisOutput(analysisText);
      return `
${enhancedAnalysis}

---
Analysis generated with advanced metrics and security considerations.`;
    } catch (error) {
      this.logger.error('Response formatting error:', error);
      return analysisText;
    }
  }

  private enhanceAnalysisOutput(analysis: string): string {
    // Add severity indicators
    const withSeverity = analysis.replace(/(CRITICAL|HIGH|MEDIUM|LOW):/g, (match) => `🔴 ${match}`);

    // Add section emojis
    const sections = {
      Security: '🔒',
      Performance: '⚡',
      'Code Quality': '✨',
      Testing: '🧪',
      Architecture: '🏗️',
      Dependencies: '📦',
    };

    let enhanced = withSeverity;
    Object.entries(sections).forEach(([section, emoji]) => {
      enhanced = enhanced.replace(new RegExp(`## ${section}`, 'g'), `## ${emoji} ${section}`);
    });

    return enhanced;
  }
}
