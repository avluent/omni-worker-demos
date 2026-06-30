/**
 * Demo 05 — Worker Lifecycle
 *
 * Demonstrates worker lifecycle management: `isDestroyed()` checks before
 * and after destruction, idempotent `destroy()` calls, and pool lifecycle.
 *
 * @feature omni-worker: lifecycle management (destroy, isDestroyed)
 * @run npx tsx node-demos/demos/05_lifecycle.ts
 */

import { createWorker, createPool } from '../runner';
import type { MathApi } from '../../shared/workers/math.worker';
import type { HeavyApi } from '../../shared/workers/heavy.worker';

async function main(): Promise<void> {
  console.log('=== Worker Lifecycle Demo ===\n');

  let worker: Awaited<ReturnType<typeof createWorker<MathApi>>> | null = null;
  let pool: Awaited<ReturnType<typeof createPool<HeavyApi>>> | null = null;

  try {
    // --- Single Worker Lifecycle ---
    console.log('[Worker]');
    worker = await createWorker<MathApi>('math.worker.ts');

    console.log(`  isDestroyed(): ${worker.isDestroyed()}`);

    const result = await worker.use().add(10, 20);
    console.log(`  add(10, 20) = ${result}`);

    console.log('  destroy() called...');
    await worker.destroy();
    console.log(`  isDestroyed(): ${worker.isDestroyed()}`);

    console.log('  destroy() called again (idempotent)...');
    await worker.destroy();
    console.log(`  isDestroyed(): ${worker.isDestroyed()}`);

    // --- Pool Lifecycle ---
    console.log('\n[Pool]');
    pool = await createPool<HeavyApi>('heavy.worker.ts', 3);

    console.log(`  getNumOfWorkers(): ${pool.getNumOfWorkers()}`);
    console.log(`  isDestroyed(): ${pool.isDestroyed()}`);

    console.log('  destroy() called...');
    await pool.destroy();
    console.log(`  isDestroyed(): ${pool.isDestroyed()}`);

    console.log('\nLifecycle demo complete.');
  } finally {
    // Defensive cleanup — idempotent destroy() is safe to call even if already destroyed
    if (worker && !worker.isDestroyed()) {
      await worker.destroy();
    }
    if (pool && !pool.isDestroyed()) {
      await pool.destroy();
    }
    console.log('All resources cleaned up.');
  }
}

main().catch((err: unknown) => {
  console.error('Demo failed:', err);
  process.exit(1);
});
