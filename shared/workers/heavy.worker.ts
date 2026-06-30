/**
 * Heavy worker — provides CPU-intensive computation operations.
 *
 * @feature omni-worker: CPU-bound tasks in workers
 * @see {@link https://github.com/avluent/omni-worker}
 */

/** Interface describing the heavy worker API shape. */
export interface HeavyApi {
  /** Returns the nth Fibonacci number (iterative). */
  fibonacci(n: number): number;
  /** Returns whether n is a prime number. */
  primeCheck(n: number): boolean;
  /** Sleeps for the given milliseconds and returns a completion message. */
  sleep(ms: number): Promise<string>;
}

/**
 * The worker API — must be exported as `api` for omni-worker.
 */
export const api: HeavyApi = {
  fibonacci(n: number): number {
    if (n < 0) {
      throw new Error('fibonacci is not defined for negative numbers');
    }
    if (n <= 1) return n;
    let a = 0;
    let b = 1;
    for (let i = 2; i <= n; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }
    return b;
  },

  primeCheck(n: number): boolean {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  },

  async sleep(ms: number): Promise<string> {
    await new Promise<void>((resolve) => setTimeout(resolve, ms));
    return `Slept for ${ms}ms`;
  },
};
