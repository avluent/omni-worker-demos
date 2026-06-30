/**
 * Demo 02 — Worker with External Dependencies
 *
 * Demonstrates that the Vite plugin bundles external npm packages (like
 * lodash-es) into the worker. The worker imports `capitalize` from lodash-es,
 * which gets inlined by esbuild during the bundling step.
 *
 * @feature omni-worker: external dependency bundling in workers
 * @run npx tsx node-demos/demos/02_worker_with_deps.ts
 */

import { createWorker } from '../runner';
import type { TextApi } from '../../shared/workers/text.worker';

async function main(): Promise<void> {
  console.log('=== Worker with External Dependencies ===');

  const worker = await createWorker<TextApi>('text.worker.ts');

  try {
    const capitalized = await worker.use().capitalize('hello world');
    console.log(`capitalize('hello world') = "${capitalized}"`);

    const reversed = await worker.use().reverse('omni-worker');
    console.log(`reverse('omni-worker') = "${reversed}"`);

    const slugified = await worker.use().slugify('Hello World!');
    console.log(`slugify('Hello World!') = "${slugified}"`);

    console.log('(lodash-es was bundled into the worker by esbuild)');
  } finally {
    await worker.destroy();
    console.log('Worker destroyed.');
  }
}

main().catch((err: unknown) => {
  console.error('Demo failed:', err);
  process.exit(1);
});
