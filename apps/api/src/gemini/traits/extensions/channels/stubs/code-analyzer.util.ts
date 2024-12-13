import { Logger } from '@nestjs/common';
import * as ts from 'typescript';
import { CodeAnalysis, MethodInfo, PropertyInfo } from '../../presenters/test-generation.interface';

export class CodeAnalyzer {
  private static readonly logger = new Logger(CodeAnalyzer.name);

  // Configurable limits to prevent excessive memory usage
  private static readonly CONFIG = {
    MAX_DEPTH: 50,
    MAX_DEPENDENCIES: 100,
    MAX_PUBLIC_METHODS: 50,
    MAX_PRIVATE_METHODS: 30,
    MAX_PROPERTIES: 30,
    MAX_COMPLEXITY: 100,
    MAX_EDGE_CASES: 20,
  };

  static analyzeCode(code: string): CodeAnalysis {
    let sourceFile: ts.SourceFile | null = null;

    try {
      // Create source file with memory-efficient parsing
      sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, false);

      const analysis: CodeAnalysis = {
        complexity: 0,
        dependencies: [],
        publicMethods: [],
        privateMethods: [],
        classProperties: [],
        potentialEdgeCases: [],
      };

      // Use a controlled traversal with depth limit
      this.visitNode(sourceFile, analysis, 0);

      // Truncate results if they exceed limits
      this.enforceAnalysisLimits(analysis);

      return analysis;
    } catch (error) {
      this.logger.error('Error analyzing code:', error);
      throw error;
    } finally {
      // Explicitly clear the source file reference
      sourceFile = null;
    }
  }

  private static visitNode(node: ts.Node, analysis: CodeAnalysis, depth: number = 0): void {
    // Prevent excessive recursion
    if (depth > this.CONFIG.MAX_DEPTH) return;

    // Check and limit data collection
    if (this.hasReachedAnalysisLimits(analysis)) return;

    // Process different node types
    if (ts.isImportDeclaration(node)) {
      this.extractDependency(node, analysis);
    } else if (ts.isMethodDeclaration(node)) {
      this.analyzeMethod(node, analysis);
    } else if (ts.isPropertyDeclaration(node)) {
      this.analyzeProperty(node, analysis);
    }

    // Recursive traversal with controlled depth
    ts.forEachChild(node, (child) => this.visitNode(child, analysis, depth + 1));
  }

  private static hasReachedAnalysisLimits(analysis: CodeAnalysis): boolean {
    const { MAX_DEPENDENCIES, MAX_PUBLIC_METHODS, MAX_PRIVATE_METHODS, MAX_PROPERTIES } = this.CONFIG;

    return (
      analysis.dependencies.length >= MAX_DEPENDENCIES ||
      analysis.publicMethods.length >= MAX_PUBLIC_METHODS ||
      analysis.privateMethods.length >= MAX_PRIVATE_METHODS ||
      analysis.classProperties.length >= MAX_PROPERTIES
    );
  }

  private static enforceAnalysisLimits(analysis: CodeAnalysis): void {
    const {
      MAX_DEPENDENCIES,
      MAX_PUBLIC_METHODS,
      MAX_PRIVATE_METHODS,
      MAX_PROPERTIES,
      MAX_COMPLEXITY,
      MAX_EDGE_CASES,
    } = this.CONFIG;

    // Truncate arrays to prevent excessive memory usage
    analysis.dependencies = analysis.dependencies.slice(0, MAX_DEPENDENCIES);
    analysis.publicMethods = analysis.publicMethods.slice(0, MAX_PUBLIC_METHODS);
    analysis.privateMethods = analysis.privateMethods.slice(0, MAX_PRIVATE_METHODS);
    analysis.classProperties = analysis.classProperties.slice(0, MAX_PROPERTIES);
    analysis.potentialEdgeCases = analysis.potentialEdgeCases.slice(0, MAX_EDGE_CASES);

    // Cap overall complexity
    analysis.complexity = Math.min(analysis.complexity, MAX_COMPLEXITY);
  }

  private static extractDependency(node: ts.ImportDeclaration, analysis: CodeAnalysis): void {
    if (this.hasReachedAnalysisLimits(analysis)) return;

    const moduleSpecifier = node.moduleSpecifier.getText().replace(/['"]/g, '');
    if (!analysis.dependencies.includes(moduleSpecifier)) {
      analysis.dependencies.push(moduleSpecifier);
    }
  }

  private static analyzeMethod(node: ts.MethodDeclaration, analysis: CodeAnalysis): void {
    if (this.hasReachedAnalysisLimits(analysis)) return;

    const methodInfo: MethodInfo = {
      name: node.name.getText(),
      parameters: this.getParameterInfo(node),
      returnType: node.type ? node.type.getText() : 'void',
      complexity: this.calculateMethodComplexity(node),
      dependencies: this.getMethodDependencies(node),
    };

    if (this.isPublicMethod(node)) {
      analysis.publicMethods.push(methodInfo);
    } else {
      analysis.privateMethods.push(methodInfo);
    }
  }

  private static analyzeProperty(node: ts.PropertyDeclaration, analysis: CodeAnalysis): void {
    const propertyInfo: PropertyInfo = {
      name: node.name.getText(),
      type: node.type ? node.type.getText() : 'any',
      accessLevel: this.getAccessLevel(node),
      isReadonly: node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ReadonlyKeyword) ?? false,
    };

    analysis.classProperties.push(propertyInfo);
  }

  private static calculateComplexity(node: ts.Node, analysis: CodeAnalysis): void {
    let complexity = 0;

    const incrementComplexity = () => complexity++;

    ts.forEachChild(node, function visit(node) {
      switch (node.kind) {
        case ts.SyntaxKind.IfStatement:
        case ts.SyntaxKind.WhileStatement:
        case ts.SyntaxKind.ForStatement:
        case ts.SyntaxKind.ForInStatement:
        case ts.SyntaxKind.ForOfStatement:
        case ts.SyntaxKind.CaseClause:
        case ts.SyntaxKind.CatchClause:
        case ts.SyntaxKind.ConditionalExpression:
        case ts.SyntaxKind.BinaryExpression:
          incrementComplexity();
          break;
      }

      ts.forEachChild(node, visit);
    });

    analysis.complexity = complexity;
  }

  private static identifyEdgeCases(node: ts.Node, analysis: CodeAnalysis): void {
    const edgeCases: string[] = [];

    ts.forEachChild(node, function visit(node) {
      if (ts.isIfStatement(node)) {
        const condition = node.expression.getText();
        if (condition.includes('null') || condition.includes('undefined')) {
          edgeCases.push(`Null/undefined check: ${condition}`);
        }
      }

      if (ts.isPropertyAccessExpression(node)) {
        edgeCases.push(`Potential null reference: ${node.getText()}`);
      }

      ts.forEachChild(node, visit);
    });

    analysis.potentialEdgeCases = edgeCases;
  }

  private static isPublicMethod(node: ts.MethodDeclaration): boolean {
    return !node.modifiers?.some(
      (m) => m.kind === ts.SyntaxKind.PrivateKeyword || m.kind === ts.SyntaxKind.ProtectedKeyword,
    );
  }

  private static getAccessLevel(node: ts.PropertyDeclaration): 'private' | 'protected' | 'public' {
    if (node.modifiers?.some((m) => m.kind === ts.SyntaxKind.PrivateKeyword)) {
      return 'private';
    }
    if (node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ProtectedKeyword)) {
      return 'protected';
    }
    return 'public';
  }

  private static calculateMethodComplexity(node: ts.MethodDeclaration): number {
    let complexity = 1;
    ts.forEachChild(node, function visit(node) {
      if (ts.isIfStatement(node) || ts.isWhileStatement(node) || ts.isForStatement(node) || ts.isCaseClause(node)) {
        complexity++;
      }
      ts.forEachChild(node, visit);
    });
    return complexity;
  }

  private static getMethodDependencies(node: ts.MethodDeclaration): string[] {
    const dependencies: string[] = [];
    ts.forEachChild(node, function visit(node) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
        dependencies.push(node.expression.getText());
      }
      ts.forEachChild(node, visit);
    });
    return [...new Set(dependencies)];
  }

  private static getParameterInfo(node: ts.MethodDeclaration): any[] {
    return node.parameters.map((param) => ({
      name: param.name.getText(),
      type: param.type ? param.type.getText() : 'any',
      isOptional: param.questionToken !== undefined,
      defaultValue: param.initializer ? param.initializer.getText() : undefined,
    }));
  }
}
