/**
 * Demo 01 — Single Worker
 *
 * Demonstrates basic omniWorker usage: creates a single worker, calls its
 * methods, and cleans up resources.
 *
 * @feature omni-worker: single worker creation and method calls
 * @run npx tsx node-demos/demos/01_single_worker.ts
 */

import { createWorker } from '../runner';
import type { MathApi } from '../../shared/workers/math.worker';

async function main(): Promise<void> {
  console.log('=== Single Worker Demo ===');

  // Auto-detect: uses the runner for Node.js (tsx) mode
  const worker = await createWorker<MathApi>('math.worker.ts');

  try {
    const addResult = await worker.use().add(10, 25);
    console.log(`add(10, 25) = ${addResult}`);

    const subtractResult = await worker.use().subtract(100, 37);
    console.log(`subtract(100, 37) = ${subtractResult}`);

    const multiplyResult = await worker.use().multiply(8, 7);
    console.log(`multiply(8, 7) = ${multiplyResult}`);

    const factorialResult = await worker.use().factorial(10);
    console.log(`factorial(10) = ${factorialResult}`);
  } finally {
    await worker.destroy();
    console.log('Worker destroyed.');
  }
}

main().catch((err: unknown) => {
  console.error('Demo failed:', err);
  process.exit(1);
});
