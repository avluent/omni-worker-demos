/**
 * Demo 06 — Complex Data Transfer
 *
 * Demonstrates passing complex data structures (objects, arrays, nested
 * structures) to workers and receiving transformed results. Shows what
 * Comlink's structured clone can serialize across the worker boundary.
 *
 * @feature omni-worker: complex data serialization via Comlink
 * @run npx tsx node-demos/demos/06_complex_data.ts
 */

import { createWorker } from '../runner';
import type { MathApi } from '../../shared/workers/math.worker';

async function main(): Promise<void> {
  console.log('=== Complex Data Transfer Demo ===\n');

  const worker = await createWorker<MathApi>('math.worker.ts');

  try {
    // 1. Plain object transfer
    const inputObj = { name: 'test', value: 42 };
    const outputObj = await worker.use().transformObject(inputObj);
    console.log('Input:', JSON.stringify(inputObj));
    console.log('Output:', JSON.stringify(outputObj));
    console.log('');

    // 2. Array transfer
    const inputArr = [1, 2, 3, 4, 5];
    const outputArr = await worker.use().transformArray(inputArr);
    console.log('Input:', JSON.stringify(inputArr));
    console.log('Output:', JSON.stringify(outputArr));
    console.log('');

    // 3. Nested object transfer
    const inputNested = { matrix: [[1, 2], [3, 4]] as unknown };
    const outputNested = await worker.use().transformObject(inputNested as Record<string, unknown>);
    console.log('Input:', JSON.stringify(inputNested));
    console.log('Output:', JSON.stringify(outputNested));
    console.log('');

    // 4. Aggregate with mixed array
    const inputData = { items: [1, 'hello', 2, 'world', 3] as unknown[] };
    const outputAgg = await worker.use().aggregate(inputData as { items: unknown[] });
    console.log('Input:', JSON.stringify({ items: [1, 'hello', 2, 'world', 3] }));
    console.log('Output:', JSON.stringify(outputAgg));

    console.log('\nComplex data transfer demo complete.');
  } finally {
    await worker.destroy();
    console.log('Worker destroyed.');
  }
}

main().catch((err: unknown) => {
  console.error('Demo failed:', err);
  process.exit(1);
});
