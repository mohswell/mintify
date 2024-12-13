import { CodeAnalysis, TestStrategy, MockStrategy } from '../../presenters/test-generation.interface';

export class TestStrategyGenerator {
  static generateStrategy(analysis: CodeAnalysis): { testStrategy: TestStrategy; mockStrategy: MockStrategy } {
    // Create a defensive copy to prevent mutation
    const safeAnalysis = { ...analysis };

    const testStrategy: TestStrategy = {
      unitTestPattern: 'describe-it',
      includeSnapshots: this.shouldIncludeSnapshots(safeAnalysis),
      includeBenchmarks: this.shouldIncludeBenchmarks(safeAnalysis),
      parallelization: this.shouldEnableParallelization(safeAnalysis),
    };

    const mockStrategy: MockStrategy = {
      preferredFramework: this.determinePreferredMockFramework(safeAnalysis),
      mockPrivateMethods: this.shouldMockPrivateMethods(safeAnalysis),
      mockExternalDependencies: safeAnalysis.dependencies.length > 0,
    };

    return { testStrategy, mockStrategy };
  }

  private static shouldIncludeSnapshots(analysis: CodeAnalysis): boolean {
    return analysis.complexity > 5 || analysis.publicMethods.length > 3;
  }

  private static shouldIncludeBenchmarks(analysis: CodeAnalysis): boolean {
    return analysis.complexity > 8 || analysis.publicMethods.some((method) => method.complexity > 4);
  }

  private static shouldEnableParallelization(analysis: CodeAnalysis): boolean {
    return analysis.publicMethods.length > 5 || analysis.complexity > 10;
  }

  private static determinePreferredMockFramework(analysis: CodeAnalysis): 'jest' | 'ts-mockito' | 'sinon' {
    if (analysis.dependencies.some((dep) => dep.includes('@angular'))) {
      return 'ts-mockito';
    }
    if (analysis.complexity > 15) {
      return 'sinon';
    }
    return 'jest';
  }

  private static shouldMockPrivateMethods(analysis: CodeAnalysis): boolean {
    return analysis.privateMethods.length > 0 && analysis.privateMethods.some((method) => method.complexity > 3);
  }
}
