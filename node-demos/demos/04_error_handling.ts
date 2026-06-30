/**
 * Demo 04 — Error Handling
 *
 * Demonstrates OmniWorkerError codes, type-safe catching with `instanceof`,
 * and proper error property inspection (code, workerPath, cause, toString).
 *
 * @feature omni-worker: structured error handling
 * @run npx tsx node-demos/demos/04_error_handling.ts
 */

import { createWorker } from '../runner';
import type { MathApi } from '../../shared/workers/math.worker';
import { OmniWorkerError } from '@anonaddy/omni-worker';

async function main(): Promise<void> {
  console.log('=== Error Handling Demo ===\n');

  const worker = await createWorker<MathApi>('math.worker.ts');

  try {
    // [1] Normal operation — should succeed
    try {
      console.log('[1] Normal operation (should succeed):');
      const result = await worker.use().add(5, 3);
      console.log(`    add(5, 3) = ${result} ✓`);
    } catch (err) {
      console.log('    ✗ Unexpected error:', err);
    }

    // [2] Using destroyed worker — triggers WORKER_ALREADY_DESTROYED
    try {
      console.log('\n[2] Using destroyed worker (should fail):');
      console.log('    Destroying worker...');
      await worker.destroy();
      console.log('    Attempting to use destroyed worker...');
      // Intentionally calling use() after destroy() to trigger WORKER_ALREADY_DESTROYED
      await worker.use().add(1, 2);
      console.log('    ✗ Expected error but none occurred');
    } catch (err) {
      if (err instanceof OmniWorkerError) {
        console.log('    ✗ OmniWorkerError caught:');
        console.log(`      code: ${err.code}`);
        console.log(`      workerPath: ${err.workerPath ?? 'n/a'}`);
        console.log(`      formatted: ${err.toString()}`);
      } else {
        console.log('    ✗ Unexpected error type:', err);
      }
    }

    console.log('\nError handling demonstration complete.');
  } finally {
    // Ensure cleanup even if an unexpected error occurred
    if (!worker.isDestroyed()) {
      await worker.destroy();
    }
    console.log('Worker destroyed.');
  }
}

main().catch((err: unknown) => {
  console.error('Demo failed:', err);
  process.exit(1);
});
