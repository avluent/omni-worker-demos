/**
 * Node.js worker runner — bundles `.worker.ts` files at runtime using esbuild.
 *
 * Because tsx does not process Vite plugins, this helper performs the same
 * transformation that `omniWorkerVite()` does: read the worker source, append
 * Comlink boilerplate, bundle with esbuild, and create an omniWorker from it.
 *
 * Usage:
 * ```ts
 * import { createWorker, createPool, resolveWorkerPath } from './runner';
 * import type { MathApi } from '../../shared/workers/math.worker';
 *
 * const worker = await createWorker<MathApi>('math.worker.ts');
 * const sum = await worker.use().add(1, 2);
 * await worker.destroy();
 * ```
 *
 * @module runner
 */

import * as esbuild from 'esbuild';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  omniWorker,
  omniWorkerPool,
  OmniWorkerError,
  OmniWorkerErrorCodes,
} from '@anonaddy/omni-worker';
import type { IOmniWorker, IOmniWorkerPool } from '@anonaddy/omni-worker';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Resolve a `.worker.ts` file relative to the shared/workers directory.
 *
 * The shared/workers/ directory is two levels up from the runner (node-demos/runner.ts):
 *   /project/shared/workers/math.worker.ts
 *   /project/node-demos/runner.ts
 *
 * @param name - Worker filename (e.g., 'math.worker.ts') or full path
 * @returns Absolute path to the worker file
 */
export function resolveWorkerPath(name: string): string {
  if (name.endsWith('.worker.ts')) {
    // Runner is at node-demos/runner.ts, shared workers at shared/workers/
    // So relative path is ../shared/workers/
    const sharedPath = join(__dirname, '..', 'shared', 'workers', name);
    try {
      readFileSync(sharedPath);
      return sharedPath;
    } catch {
      // Try from project root
      const rootPath = join(process.cwd(), 'shared', 'workers', name);
      try {
        readFileSync(rootPath);
        return rootPath;
      } catch {
        // Fall through to absolute resolution
      }
    }
  }
  return resolve(name);
}

/**
 * Bundle a `.worker.ts` file using esbuild (same logic as omniWorkerVite plugin).
 *
 * @param workerPath - Absolute path to the `.worker.ts` file
 * @returns The bundled JavaScript source code string
 * @throws {OmniWorkerError} If the worker file cannot be read or bundled
 */
async function bundleWorker(workerPath: string): Promise<string> {
  let source: string;
  try {
    source = readFileSync(workerPath, 'utf-8');
  } catch (error) {
    throw new OmniWorkerError(
      `Cannot read worker file '${workerPath}'`,
      {
        code: OmniWorkerErrorCodes.WORKER_NOT_FOUND,
        workerPath,
        cause: error instanceof Error ? error : new Error(String(error)),
      },
    );
  }

  // Validate: must export an 'api' object
  if (!source.includes('export') || !source.includes('api')) {
    throw new OmniWorkerError(
      `Worker file '${workerPath}' must export an 'api' object containing your functions`,
      {
        code: OmniWorkerErrorCodes.MISSING_API_EXPORT,
        workerPath,
      },
    );
  }

  // Append Comlink expose boilerplate before bundling
  // For Node.js worker_threads, we need comlink's node-adapter as the endpoint
  const fullSource = `${source}

import * as Comlink from 'comlink';
import nodeAdapter from 'comlink/dist/esm/node-adapter.mjs';
import { parentPort } from 'node:worker_threads';
if (parentPort) {
  Comlink.expose(api, nodeAdapter(parentPort));
}
`;

  // Bundle with esbuild — platform 'node' so built-ins are resolved,
  // but comlink is bundled (NOT external) so it works in eval mode
  let bundled: string;
  try {
    const result = await esbuild.build({
      stdin: {
        contents: fullSource,
        resolveDir: dirname(workerPath),
        sourcefile: workerPath,
        loader: 'ts',
      },
      bundle: true,
      write: false,
      format: 'esm',
      platform: 'node',
      target: 'es2018',
      minify: false,
      treeShaking: true,
      // comlink is bundled into the worker code (needed for eval mode)
    });

    const outputFile = result.outputFiles?.[0];
    if (!outputFile) {
      throw new Error('esbuild produced no output');
    }
    bundled = Buffer.from(outputFile.text).toString('utf-8');
  } catch (error) {
    if (error instanceof OmniWorkerError) throw error;
    throw new OmniWorkerError(
      `Failed to build worker '${workerPath}'`,
      {
        code: OmniWorkerErrorCodes.BUILD_ERROR,
        workerPath,
        cause: error instanceof Error ? error : new Error(String(error)),
      },
    );
  }

  return bundled;
}

/**
 * Create a single omniWorker from a `.worker.ts` file (Node.js mode).
 *
 * Bundles the worker at runtime and creates a Node-based worker using
 * the bundled code string.
 *
 * @typeParam T - Interface describing the worker's API shape
 * @param nameOrPath - Worker filename (e.g., 'math.worker.ts') or absolute path
 * @returns A typed omniWorker instance
 * @example
 * ```ts
 * const worker = await createWorker<MathApi>('math.worker.ts');
 * const sum = await worker.use().add(1, 2);
 * await worker.destroy();
 * ```
 */
export async function createWorker<T>(
  nameOrPath: string,
): Promise<IOmniWorker<T>> {
  const workerPath = resolveWorkerPath(nameOrPath);
  const bundledCode = await bundleWorker(workerPath);
  return omniWorker<T>(nameOrPath, bundledCode);
}

/**
 * Create a pool of omniWorkers from a `.worker.ts` file (Node.js mode).
 *
 * Bundles the worker at runtime and creates multiple Node-based workers
 * using the same bundled code string.
 *
 * @typeParam T - Interface describing the worker's API shape
 * @param nameOrPath - Worker filename or absolute path
 * @param count - Number of workers in the pool (default: 4)
 * @returns A typed omniWorkerPool instance
 * @example
 * ```ts
 * const pool = await createPool<HeavyApi>('heavy.worker.ts', 4);
 * const results = await Promise.all(
 *   [30, 31, 32].map(n => pool.use().fibonacci(n))
 * );
 * await pool.destroy();
 * ```
 */
export async function createPool<T>(
  nameOrPath: string,
  count: number = 4,
): Promise<IOmniWorkerPool<T>> {
  const workerPath = resolveWorkerPath(nameOrPath);
  const bundledCode = await bundleWorker(workerPath);
  return omniWorkerPool<T>(nameOrPath, bundledCode, { count });
}
