/**
 * Demo 03 — Worker Pool (Round-Robin)
 *
 * Demonstrates omniWorkerPool with multiple workers distributing tasks
 * in round-robin fashion. 8 Fibonacci computations are dispatched across
 * 4 workers (2 per worker).
 *
 * @feature omni-worker: worker pool with round-robin dispatch
 * @run npx tsx node-demos/demos/03_worker_pool.ts
 */

import { createPool } from '../runner';
import type { HeavyApi } from '../../shared/workers/heavy.worker';

async function main(): Promise<void> {
  console.log('=== Worker Pool Demo (Round-Robin) ===');

  const poolSize = 4;
  const pool = await createPool<HeavyApi>('heavy.worker.ts', poolSize);

  try {
    console.log(`Pool size: ${pool.getNumOfWorkers()} workers`);

    // 8 tasks: fibonacci(27) through fibonacci(34)
    const tasks: number[] = [30, 31, 29, 32, 28, 33, 27, 34];
    console.log(`Tasks submitted: ${tasks.length}`);
    console.log('');

    const results = await Promise.all(
      tasks.map((n) => pool.use().fibonacci(n)),
    );

    for (let i = 0; i < tasks.length; i++) {
      console.log(`fibonacci(${tasks[i]}) = ${results[i]}`);
    }

    console.log('');
    console.log(
      `Tasks distributed across ${poolSize} workers (round-robin).`,
    );
  } finally {
    await pool.destroy();
    console.log('Pool destroyed.');
  }
}

main().catch((err: unknown) => {
  console.error('Demo failed:', err);
  process.exit(1);
});
