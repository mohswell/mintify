import { CodeAnalysis, TestStrategy, MockStrategy } from '../../presenters/test-generation.interface';

export class PromptBuilder {
  static buildTestGenerationPrompt(
    code: string,
    analysis: CodeAnalysis,
    testStrategy: TestStrategy,
    mockStrategy: MockStrategy,
  ): string {
    const complexityWarnings = this.generateComplexityWarnings(analysis);
    const edgeCasesSuggestions = this.generateEdgeCasesSuggestions(analysis);
    const mockingStrategy = this.generateMockingStrategy(mockStrategy, analysis);

    return `You are an expert AI assistant and exceptional senior test engineer generating comprehensive Jest/TypeScript tests with vast knowledge across multiple programming languages, and best practices.


CODE ANALYSIS:
${this.formatCodeAnalysis(analysis)}

COMPLEXITY WARNINGS:
${complexityWarnings}

EDGE CASES TO CONSIDER:
${edgeCasesSuggestions}

MOCKING STRATEGY:
${mockingStrategy}

TEST REQUIREMENTS:
1. Use ${testStrategy.unitTestPattern} pattern
2. ${testStrategy.includeSnapshots ? 'Include' : 'Skip'} snapshot testing
3. ${testStrategy.includeBenchmarks ? 'Include' : 'Skip'} performance benchmarks
4. ${testStrategy.parallelization ? 'Enable' : 'Skip'} test parallelization
5. Coverage threshold: Statements (80%), Branches (70%), Functions (80%), Lines (80%)

CODE TO TEST:
${code}

Please generate a complete test suite with:

1. Unit Tests
- Test each public method
- Include error handling
- Add performance benchmarks where needed
- Use appropriate mocking strategy

2. Edge Cases
- Cover identified edge cases
- Include error boundaries
- Test extreme inputs

3. Integration Tests (if applicable)
- Test component interactions
- Verify dependency integration
- Check error propagation

4. Coverage Analysis
- Identify uncovered paths
- Suggest additional test cases
- Report expected coverage metrics

Generate production-ready test code with detailed comments.`;
  }

  private static formatCodeAnalysis(analysis: CodeAnalysis): string {
    return `- Complexity Score: ${analysis.complexity}
- Public Methods: ${analysis.publicMethods.length}
- Private Methods: ${analysis.privateMethods.length}
- Dependencies: ${analysis.dependencies.join(', ')}
- Properties: ${analysis.classProperties.length}`;
  }

  private static generateComplexityWarnings(analysis: CodeAnalysis): string {
    const warnings: string[] = [];

    if (analysis.complexity > 10) {
      warnings.push('⚠️ High overall complexity - consider breaking down into smaller units');
    }

    analysis.publicMethods
      .filter((method) => method.complexity > 5)
      .forEach((method) => {
        warnings.push(`⚠️ High complexity in ${method.name} (${method.complexity}) - needs thorough testing`);
      });

    return warnings.length > 0 ? warnings.join('\n') : 'No significant complexity warnings';
  }

  private static generateEdgeCasesSuggestions(analysis: CodeAnalysis): string {
    return analysis.potentialEdgeCases.map((edge) => `- ${edge}`).join('\n');
  }

  private static generateMockingStrategy(mockStrategy: MockStrategy, analysis: CodeAnalysis): string {
    return `- Framework: ${mockStrategy.preferredFramework}
- Mock private methods: ${mockStrategy.mockPrivateMethods ? 'Yes' : 'No'}
- External dependencies to mock: ${analysis.dependencies.join(', ')}`;
  }
}
