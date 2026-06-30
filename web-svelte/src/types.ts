/**
 * Omni Worker Web Demo — Shared worker type definitions.
 *
 * Mirrors the public types from shared/workers/*.worker.ts so that
 * TypeScript can resolve types without needing to process the actual
 * .worker.ts files (which are transformed by Vite at build time).
 *
 * @module types
 */

/** Math worker API (from shared/workers/math.worker.ts). */
export interface MathApi {
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
  multiply(a: number, b: number): number;
  factorial(n: number): number;
  transformObject(obj: Record<string, unknown>): Record<string, unknown>;
  transformArray(arr: number[]): number[];
  aggregate(data: { items: unknown[] }): { count: number; sum: number };
}

/** Heavy worker API (from shared/workers/heavy.worker.ts). */
export interface HeavyApi {
  fibonacci(n: number): number;
  primeCheck(n: number): boolean;
  sleep(ms: number): Promise<string>;
}
