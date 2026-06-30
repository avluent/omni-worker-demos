<script lang="ts">
  import { onDestroy } from 'svelte';
  import { omniWorkerPool } from '@anonaddy/omni-worker';
  // @ts-expect-error Vite omniWorkerVite plugin transforms .worker.ts at build time
  import workerUrl from '../../shared/workers/heavy.worker.ts';
  import type { HeavyApi } from './types';
  import type { StatusState } from './appTypes';

  /** Callback for updating the global status bar. */
  export let setStatus: (state: StatusState, message: string) => void;

  let pool: ReturnType<typeof omniWorkerPool<HeavyApi>> | null = null;
  let poolSize: number = 4;
  let disabled: boolean = false;

  /** Progress state for each task. */
  interface TaskProgress {
    label: string;
    pct: number;
    text: string;
    done: boolean;
  }

  const defaultTasks: { label: string; fn: keyof HeavyApi; arg: number }[] = [
    { label: 'Fibonacci(30)', fn: 'fibonacci', arg: 30 },
    { label: 'Fibonacci(31)', fn: 'fibonacci', arg: 31 },
    { label: 'Fibonacci(32)', fn: 'fibonacci', arg: 32 },
    { label: 'Prime(999983)', fn: 'primeCheck', arg: 999983 },
    { label: 'Prime(999979)', fn: 'primeCheck', arg: 999979 },
    { label: 'Prime(1000003)', fn: 'primeCheck', arg: 1000003 },
    { label: 'Sleep(300ms)', fn: 'sleep', arg: 300 },
    { label: 'Sleep(500ms)', fn: 'sleep', arg: 500 },
  ];

  let tasks: TaskProgress[] = defaultTasks.map((t) => ({
    label: t.label,
    pct: 0,
    text: 'Pending',
    done: false,
  }));

  onDestroy(() => {
    if (pool && !pool.isDestroyed()) {
      pool.destroy();
    }
    pool = null;
  });

  /** Update progress for a single task (Svelte reactive helper). */
  function updateProgress(index: number, pct: number, text: string): void {
    tasks = tasks.map((t, i) => {
      if (i === index) {
        return { ...t, pct, text, done: pct === 100 };
      }
      return t;
    });
  }

  /** Run all pool tasks in parallel. */
  async function run(): Promise<void> {
    disabled = true;

    // Reset progress
    tasks = defaultTasks.map((task, _i) => ({
      label: task.label,
      pct: 0,
      text: 'Pending',
      done: false,
    }));

    setStatus('running', `Pool running (${poolSize} workers)...`);

    // Create pool (destroy existing first)
    if (pool && !pool.isDestroyed()) {
      await pool.destroy();
    }
    pool = omniWorkerPool<HeavyApi>('heavy', workerUrl as string, {
      count: poolSize,
    });

    const overallStart = performance.now();
    const pending = new Set<number>();
    for (let i = 0; i < defaultTasks.length; i++) {
      pending.add(i);
    }

    const totalTasks = defaultTasks.length;

    try {
      await Promise.all(
        defaultTasks.map(async (task, index) => {
          // Simulate 20% progress immediately
          updateProgress(index, 20, 'Running...');

          const start = performance.now();
          let result: unknown;

          try {
            switch (task.fn) {
              case 'fibonacci':
                result = await pool!.use().fibonacci(task.arg);
                break;
              case 'primeCheck':
                result = await pool!.use().primeCheck(task.arg);
                break;
              case 'sleep':
                result = await pool!.use().sleep(task.arg);
                break;
            }
          } catch (err) {
            updateProgress(index, 100, 'Error');
            pending.delete(index);
            if (pending.size === 0) {
              const totalElapsed = (performance.now() - overallStart).toFixed(2);
              setStatus('error', `Pool tasks completed with errors (${totalElapsed}ms)`);
            }
            return;
          }

          const elapsed = (performance.now() - start).toFixed(2);
          updateProgress(index, 100, `${result} (${elapsed}ms)`);

          pending.delete(index);
          if (pending.size === 0) {
            const totalElapsed = (performance.now() - overallStart).toFixed(2);
            setStatus(
              'success',
              `All ${totalTasks} tasks done (${totalElapsed}ms, ${poolSize} workers)`,
            );
          }
        }),
      );
    } finally {
      disabled = false;
    }
  }
</script>

<h2 style="margin-top: 0">Worker Pool Demo</h2>

<p style="color: #555; font-size: 0.9rem">
  Uses omniWorkerPool&lt;HeavyApi&gt;() — a pool of {poolSize} Web Workers with
  round-robin dispatch. Runs {defaultTasks.length} tasks in parallel.
</p>

<!-- Controls -->
<div class="control-group">
  <div class="input-field">
    <label for="pool-size-svelte">Pool Size</label>
    <select id="pool-size-svelte" bind:value={poolSize} aria-label="Number of workers in pool">
      {#each [1, 2, 4, 8] as size}
        <option value={size}>{String(size)}</option>
      {/each}
    </select>
  </div>

  <button class="btn" on:click={run} disabled={disabled} aria-label="Execute pool tasks">
    Run {defaultTasks.length} Tasks
  </button>
</div>

<!-- Progress area -->
<div
  class="progress-list"
  aria-live="polite"
  aria-atomic="true"
  aria-label="Task progress"
>
  {#each tasks as task, i (i)}
    <div class="progress-item">
      <span class="progress-label">{task.label}</span>
      <div class="progress-track">
        <div
          class="progress-fill{task.done ? ' done' : ''}"
          style="width: {task.pct}%;"
          role="progressbar"
          aria-valuenow={task.pct}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
      <span class="progress-text">{task.text}</span>
    </div>
  {/each}
</div>
