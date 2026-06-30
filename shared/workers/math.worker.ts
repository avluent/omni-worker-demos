/**
 * Math worker — provides basic arithmetic operations.
 *
 * @feature omni-worker: shared worker definition
 * @see {@link https://github.com/avluent/omni-worker}
 */

/** Interface describing the math worker API shape. */
export interface MathApi {
  /** Returns the sum of a and b. */
  add(a: number, b: number): number;
  /** Returns the difference of a and b. */
  subtract(a: number, b: number): number;
  /** Returns the product of a and b. */
  multiply(a: number, b: number): number;
  /** Returns the factorial of n (iterative, n >= 0). */
  factorial(n: number): number;
  /** Transforms a plain object: string keys uppercased, numeric values doubled. */
  transformObject(obj: Record<string, unknown>): Record<string, unknown>;
  /** Squares each element of a number array. */
  transformArray(arr: number[]): number[];
  /** Aggregates items: returns count and sum of numeric values. */
  aggregate(data: { items: unknown[] }): { count: number; sum: number };
}

/**
 * The worker API — must be exported as `api` for omni-worker.
 */
export const api: MathApi = {
  add(a: number, b: number): number {
    return a + b;
  },

  subtract(a: number, b: number): number {
    return a - b;
  },

  multiply(a: number, b: number): number {
    return a * b;
  },

  factorial(n: number): number {
    if (n < 0) {
      throw new Error('factorial is not defined for negative numbers');
    }
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  },

  transformObject(obj: Record<string, unknown>): Record<string, unknown> {
    const transformed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = typeof key === 'string' ? key.toUpperCase() : String(key);
      transformed[newKey] = typeof value === 'number' ? value * 2 : value;
    }
    return transformed;
  },

  transformArray(arr: number[]): number[] {
    return arr.map((n) => n * n);
  },

  aggregate(data: { items: unknown[] }): { count: number; sum: number } {
    let sum = 0;
    let count = 0;
    for (const item of data.items) {
      if (typeof item === 'number') {
        sum += item;
        count++;
      }
    }
    return { count, sum };
  },
};
