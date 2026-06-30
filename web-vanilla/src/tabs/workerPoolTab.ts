/**
 * Tab: Worker Pool
 *
 * Demonstrates `omniWorkerPool<HeavyApi>()` with multiple workers
 * executing tasks in parallel. Progress bars show per-task status.
 *
 * @module tabs/workerPoolTab
 */

import { omniWorkerPool } from '@anonaddy/omni-worker';
// @ts-expect-error Vite omniWorkerVite plugin transforms .worker.ts at build time
import workerUrl from '../../../shared/workers/heavy.worker.ts';
import type { HeavyApi } from '../types';
import type { TabModule, StatusCallback } from '../app';

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

/**
 * Manages an omniWorkerPool instance for the heavy worker.
 */
export class WorkerPoolTab implements TabModule {
  private pool: ReturnType<typeof omniWorkerPool<HeavyApi>> | null = null;

  async destroy(): Promise<void> {
    if (this.pool && !this.pool.isDestroyed()) {
      await this.pool.destroy();
    }
    this.pool = null;
  }

  render(panel: HTMLElement, onStatus: StatusCallback): void {
    // ── Heading ──
    const h2 = document.createElement('h2');
    h2.textContent = 'Worker Pool Demo';
    h2.style.marginTop = '0';
    panel.appendChild(h2);

    // ── Description ──
    const desc = document.createElement('p');
    desc.textContent =
      'Uses omniWorkerPool<HeavyApi>() — a pool of 4 Web Workers with round-robin dispatch. Runs 8 tasks in parallel.';
    desc.style.color = '#555';
    desc.style.fontSize = '0.9rem';
    panel.appendChild(desc);

    // ── Controls ──
    const controls = document.createElement('div');
    controls.className = 'control-group';

    // Pool size selector
    const groupSize = document.createElement('div');
    groupSize.className = 'input-field';
    const labelSize = document.createElement('label');
    labelSize.htmlFor = 'pool-size';
    labelSize.textContent = 'Pool Size';
    const selectSize = document.createElement('select');
    selectSize.id = 'pool-size';
    selectSize.setAttribute('aria-label', 'Number of workers in pool');
    for (const size of [1, 2, 4, 8]) {
      const opt = document.createElement('option');
      opt.value = String(size);
      opt.textContent = String(size);
      if (size === 4) opt.selected = true;
      selectSize.appendChild(opt);
    }
    groupSize.appendChild(labelSize);
    groupSize.appendChild(selectSize);
    controls.appendChild(groupSize);

    // Run button
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.id = 'pool-run';
    btn.textContent = `Run ${DEFAULT_TASKS.length} Tasks`;
    btn.setAttribute('aria-label', 'Execute pool tasks');
    controls.appendChild(btn);

    panel.appendChild(controls);

    // ── Progress area ──
    const progressArea = document.createElement('div');
    progressArea.id = 'pool-progress';
    progressArea.className = 'progress-list';
    progressArea.setAttribute('aria-live', 'polite');
    progressArea.setAttribute('aria-atomic', 'true');
    progressArea.setAttribute('aria-label', 'Task progress');
    panel.appendChild(progressArea);

    // Build progress items
    for (const task of DEFAULT_TASKS) {
      const item = document.createElement('div');
      item.className = 'progress-item';
      item.dataset.taskIndex = String(
        DEFAULT_TASKS.indexOf(task),
      ) as unknown as string;

      const label = document.createElement('span');
      label.className = 'progress-label';
      label.textContent = task.label;
      item.appendChild(label);

      const track = document.createElement('div');
      track.className = 'progress-track';
      const fill = document.createElement('div');
      fill.className = 'progress-fill';
      fill.setAttribute('role', 'progressbar');
      fill.setAttribute('aria-valuenow', '0');
      fill.setAttribute('aria-valuemin', '0');
      fill.setAttribute('aria-valuemax', '100');
      track.appendChild(fill);
      item.appendChild(track);

      const text = document.createElement('span');
      text.className = 'progress-text';
      text.textContent = 'Pending';
      item.appendChild(text);

      progressArea.appendChild(item);
    }

    // ── Wire up click ──
    btn.addEventListener('click', async () => {
      await this.handleRun(
        selectSize,
        btn,
        progressArea,
        onStatus,
      );
    });
  }

  activate(_panel: HTMLElement, _onStatus: StatusCallback): void {
    // Pool is created on-demand
  }

  /* ── Handler ────────────────────────────────────────────────── */

  private async handleRun(
    selectSize: HTMLSelectElement,
    btn: HTMLButtonElement,
    progressArea: HTMLElement,
    onStatus: StatusCallback,
  ): Promise<void> {
    btn.disabled = true;
    const poolSize = parseInt(selectSize.value, 10);

    // Reset all progress bars
    const fills = progressArea.querySelectorAll<HTMLElement>(
      '.progress-fill',
    );
    const texts = progressArea.querySelectorAll<HTMLElement>(
      '.progress-text',
    );
    fills.forEach((f) => {
      f.style.width = '0%';
      f.classList.remove('done');
      f.setAttribute('aria-valuenow', '0');
    });
    texts.forEach((t) => {
      t.textContent = 'Pending';
    });

    onStatus('running', `Pool running (${poolSize} workers)...`);

    // Create pool
    if (this.pool && !this.pool.isDestroyed()) {
      await this.pool.destroy();
    }
    this.pool = omniWorkerPool<HeavyApi>('heavy', workerUrl, {
      count: poolSize,
    });

    const overallStart = performance.now();
    const pending = new Set<number>();
    for (let i = 0; i < DEFAULT_TASKS.length; i++) {
      pending.add(i);
    }

    const totalTasks = DEFAULT_TASKS.length;

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
                result = await this.pool!.use().fibonacci(task.arg);
                break;
              case 'primeCheck':
                result = await this.pool!.use().primeCheck(task.arg);
                break;
              case 'sleep':
                result = await this.pool!.use().sleep(task.arg);
                break;
            }
          } catch (err) {
            updateProgress(index, 100, 'Error');
            pending.delete(index);
            if (pending.size === 0) {
              const totalElapsed = (
                performance.now() - overallStart
              ).toFixed(2);
              onStatus(
                'error',
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
            onStatus(
              'success',
              `All ${totalTasks} tasks done (${totalElapsed}ms, ${poolSize} workers)`,
            );
          }
        }),
      );
    } finally {
      btn.disabled = false;
    }

    // Helpers
    function updateProgress(
      index: number,
      pct: number,
      text: string,
    ): void {
      const fill = fills[index] as HTMLDivElement;
      const textEl = texts[index] as HTMLSpanElement;
      if (pct === 100) {
        fill.classList.add('done');
      }
      fill.style.width = `${pct}%`;
      fill.setAttribute('aria-valuenow', String(pct));
      textEl.textContent = text;
    }
  }
}
