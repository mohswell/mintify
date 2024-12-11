export interface TestGenerationConfig {
  framework: 'jest' | 'mocha';
  language: 'typescript' | 'javascript';
  includeIntegrationTests: boolean;
  coverageThreshold?: number;
  testStrategy?: TestStrategy;
  mockStrategy?: MockStrategy;
}

export interface TestStrategy {
  unitTestPattern: 'describe-it' | 'test';
  includeSnapshots: boolean;
  includeBenchmarks: boolean;
  parallelization: boolean;
}

export interface MockStrategy {
  preferredFramework: 'jest' | 'ts-mockito' | 'sinon';
  mockPrivateMethods: boolean;
  mockExternalDependencies: boolean;
}

export interface CodeAnalysis {
  complexity: number;
  dependencies: string[];
  publicMethods: MethodInfo[];
  privateMethods: MethodInfo[];
  classProperties: PropertyInfo[];
  potentialEdgeCases: string[];
}

export interface MethodInfo {
  name: string;
  parameters: ParameterInfo[];
  returnType: string;
  complexity: number;
  dependencies: string[];
}

export interface ParameterInfo {
  name: string;
  type: string;
  isOptional: boolean;
  defaultValue?: string;
}

export interface PropertyInfo {
  name: string;
  type: string;
  accessLevel: 'private' | 'protected' | 'public';
  isReadonly: boolean;
}

export interface TestCase {
  name: string;
  description: string;
  setup?: string;
  execution: string;
  assertions: string[];
  complexity: number;
  coverage: CoverageInfo;
}

export interface CoverageInfo {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface TestSuite {
  overview: string;
  unitTests: TestCase[];
  edgeCases: TestCase[];
  integrationTests?: TestCase[];
  coverageConsiderations: string[];
  benchmarks?: BenchmarkInfo[];
}

export interface BenchmarkInfo {
  name: string;
  executionTime: number;
  memoryUsage: number;
}
