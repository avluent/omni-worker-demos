/**
 * Tab: Worker Pool
 *
 * Demonstrates `omniWorkerPool<HeavyApi>()` with multiple workers
 * executing tasks in parallel. Progress bars show per-task status.
 */

import { useState, useCallback } from 'react';
import { omniWorkerPool } from '@anonaddy/omni-worker';
// @ts-expect-error Vite omniWorkerVite plugin transforms .worker.ts at build time
import workerUrl from '../../../shared/workers/heavy.worker.ts';
import type { HeavyApi } from '../types';
import { useOmniWorkerPool } from '../hooks/useOmniWorkerPool';

/** Configuration for a single pool task. */
interface PoolTask {
  label: string;
  fn: keyof HeavyApi;
  arg: number;
}

/** Default tasks to run across the pool. */
const DEFAULT_TASKS: PoolTask[] = [
  { label: 'Fibonacci(30)', fn: 'fibonacci', arg: 30 },
  { label: 'Fibonacci(31)', fn: 'fibonacci', arg: 31 },
  { label: 'Fibonacci(32)', fn: 'fibonacci', arg: 32 },
  { label: 'Prime(999983)', fn: 'primeCheck', arg: 999983 },
  { label: 'Prime(999979)', fn: 'primeCheck', arg: 999979 },
  { label: 'Prime(1000003)', fn: 'primeCheck', arg: 1000003 },
  { label: 'Sleep(300ms)', fn: 'sleep', arg: 300 },
  { label: 'Sleep(500ms)', fn: 'sleep', arg: 500 },
];

/** Per-task progress state. */
interface TaskProgress {
  percentage: number;
  text: string;
  done: boolean;
}

/**
 * Renders the Worker Pool tab UI.
 */
export function WorkerPoolTab(): JSX.Element {
  const [poolSize, setPoolSize] = useState<number>(4);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<TaskProgress[]>(
    DEFAULT_TASKS.map(() => ({ percentage: 0, text: 'Pending', done: false })),
  );

  // Pool lifecycle managed by hook: created on mount, destroyed on unmount
  // Note: poolSize is baked in at mount; changing it remounts this tab
  const { pool, workerCount, isReady, isDestroyed } = useOmniWorkerPool<HeavyApi>(() =>
    omniWorkerPool<HeavyApi>('heavy', workerUrl, { count: poolSize }),
  );

  const handleRun = useCallback(async (): Promise<void> => {
    if (!pool) return;

    setLoading(true);

    // Reset progress
    setProgress(
      DEFAULT_TASKS.map(() => ({ percentage: 0, text: 'Pending', done: false })),
    );

    const overallStart = performance.now();
    const pending = new Set<number>();
    for (let i = 0; i < DEFAULT_TASKS.length; i++) {
      pending.add(i);
    }
    const totalTasks = DEFAULT_TASKS.length;

    const updateProgress = (
      index: number,
      pct: number,
      text: string,
    ): void => {
      setProgress((prev) => {
        const next = [...prev];
        next[index] = {
          percentage: pct,
          text,
          done: pct === 100,
        };
        return next;
      });
    };

    try {
      await Promise.all(
        DEFAULT_TASKS.map(async (task, index) => {
          // Simulate 20% progress immediately
          updateProgress(index, 20, 'Running...');

          const start = performance.now();
          let result: unknown;

          try {
            switch (task.fn) {
              case 'fibonacci':
                result = await pool.use().fibonacci(task.arg);
                break;
              case 'primeCheck':
                result = await pool.use().primeCheck(task.arg);
                break;
              case 'sleep':
                result = await pool.use().sleep(task.arg);
                break;
            }
          } catch (_err) {
            updateProgress(index, 100, 'Error');
            pending.delete(index);
            if (pending.size === 0) {
              const totalElapsed = (
                performance.now() - overallStart
              ).toFixed(2);
              // eslint-disable-next-line no-console
              console.log(
                `Pool tasks completed with errors (${totalElapsed}ms)`,
              );
            }
            return;
          }

          const elapsed = (performance.now() - start).toFixed(2);
          updateProgress(index, 100, `${result} (${elapsed}ms)`);

          pending.delete(index);
          if (pending.size === 0) {
            const totalElapsed = (
              performance.now() - overallStart
            ).toFixed(2);
            // eslint-disable-next-line no-console
            console.log(
              `All ${totalTasks} tasks done (${totalElapsed}ms, ${workerCount} workers)`,
            );
          }
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [pool, workerCount]);

  return (
    <div>
      <h2 style={{ marginTop: '0' }}>Worker Pool Demo</h2>
      <p style={{ color: '#555', fontSize: '0.9rem' }}>
        Uses omniWorkerPool&lt;HeavyApi&gt;() — a pool of {workerCount} Web Workers
        with round-robin dispatch. Runs {DEFAULT_TASKS.length} tasks in parallel.
      </p>

      {/* Pool status badge */}
      <div
        className="status-badge"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '14px',
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        <span
          className={`status-dot${!isReady && !isDestroyed ? '' : isDestroyed ? ' idle' : ' error'}`}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isDestroyed ? '#9ca3af' : isReady ? '#22c55e' : '#ef4444',
          }}
          aria-hidden="true"
        />
        {isDestroyed
          ? 'Pool destroyed'
          : isReady
            ? `Pool active (${workerCount} worker${workerCount === 1 ? '' : 's'})`
            : 'Pool not loaded'}
      </div>

      <div className="control-group">
        <div className="input-field">
          <label htmlFor="react-pool-size">Pool Size</label>
          <select
            id="react-pool-size"
            value={poolSize}
            onChange={(e) => setPoolSize(parseInt(e.target.value, 10))}
            disabled={loading}
            aria-label="Number of workers in pool"
          >
            {[1, 2, 4, 8].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn"
          onClick={handleRun}
          disabled={loading}
          aria-label="Execute pool tasks"
        >
          {loading ? 'Running…' : `Run ${DEFAULT_TASKS.length} Tasks`}
        </button>
      </div>

      <div
        className="progress-list"
        aria-live="polite"
        aria-atomic="true"
        aria-label="Task progress"
      >
        {DEFAULT_TASKS.map((task, index) => (
          <div className="progress-item" key={index}>
            <span className="progress-label">{task.label}</span>
            <div className="progress-track">
              <div
                className={`progress-fill${progress[index].done ? ' done' : ''}`}
                role="progressbar"
                aria-valuenow={progress[index].percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{ width: `${progress[index].percentage}%` }}
              />
            </div>
            <span className="progress-text">{progress[index].text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
