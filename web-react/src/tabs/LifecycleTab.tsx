/**
 * Tab: Lifecycle
 *
 * Demonstrates worker lifecycle management: `destroy()`, `isDestroyed()`,
 * and the ability to create and destroy workers on demand.
 */

import { useState, useCallback } from 'react';
import { omniWorker } from '@anonaddy/omni-worker';
// @ts-expect-error Vite omniWorkerVite plugin transforms .worker.ts at build time
import workerUrl from '../../../shared/workers/math.worker.ts';
import type { MathApi } from '../types';
import type { IOmniWorker } from '@anonaddy/omni-worker';

/**
 * Renders the Lifecycle tab UI.
 */
export function LifecycleTab(): JSX.Element {
  const [worker, setWorker] = useState<IOmniWorker<MathApi> | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = useCallback(async (): Promise<void> => {
    setResult(null);

    // Destroy existing if any
    if (worker && !worker.isDestroyed()) {
      await worker.destroy();
    }

    try {
      const w = omniWorker<MathApi>('math-lifecycle', workerUrl);
      setWorker(w);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setResult(`Create failed: ${err.message}`);
      } else {
        setResult('Create failed');
      }
    }
  }, [worker]);

  const handleDestroy = useCallback(async (): Promise<void> => {
    setResult(null);

    if (!worker) {
      setResult('No worker to destroy');
      return;
    }

    try {
      await worker.destroy();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setResult(`Destroy failed: ${err.message}`);
      } else {
        setResult('Destroy failed');
      }
    }
  }, [worker]);

  const handleUse = useCallback(async (): Promise<void> => {
    setResult(null);

    if (!worker) {
      setResult('No worker exists — create one first');
      return;
    }

    // Check isDestroyed()
    if (worker.isDestroyed()) {
      setResult(
        'Worker is destroyed (isDestroyed() = true). This is expected.',
      );
      return;
    }

    setLoading(true);
    try {
      const resultValue = await worker.use().add(100, 200);
      setResult(`Worker alive — add(100, 200) = ${resultValue}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setResult(`Test failed: ${err.message}`);
      } else {
        setResult('Test failed');
      }
    } finally {
      setLoading(false);
    }
  }, [worker]);

  const hasWorker = worker !== null;
  const isDestroyed = worker?.isDestroyed() ?? true;
  const canDestroy = hasWorker && !isDestroyed;
  const canUse = hasWorker && !isDestroyed;

  return (
    <div>
      <h2 style={{ marginTop: '0' }}>Lifecycle Demo</h2>
      <p style={{ color: '#555', fontSize: '0.9rem' }}>
        Demonstrates destroy() and isDestroyed(). Create a worker, check its
        state, destroy it, then try to use it.
      </p>

      <div className="control-group">
        <button
          className="btn"
          onClick={handleCreate}
          disabled={loading}
          aria-label="Create a new worker instance"
        >
          Create Worker
        </button>
        <button
          className="btn btn-danger"
          onClick={handleDestroy}
          disabled={!canDestroy || loading}
          aria-label="Destroy the current worker"
        >
          Destroy Worker
        </button>
        <button
          className="btn"
          onClick={handleUse}
          disabled={!canUse || loading}
          aria-label="Test if worker is alive"
        >
          {loading ? 'Running…' : 'Test Worker'}
        </button>
      </div>

      {/* State indicator */}
      <div aria-live="polite" aria-atomic="true">
        {hasWorker && (
          <div
            className={`state-indicator ${isDestroyed ? 'destroyed' : 'alive'}`}
          >
            <span className="state-dot" aria-hidden="true" />
            <span>{isDestroyed ? 'Worker destroyed' : 'Worker alive'}</span>
          </div>
        )}
      </div>

      {/* Result area */}
      {result !== null && (
        <div
          className={isDestroyed ? 'error-box' : 'result-box'}
          role="alert"
          aria-live="assertive"
        >
          {result}
        </div>
      )}
    </div>
  );
}
