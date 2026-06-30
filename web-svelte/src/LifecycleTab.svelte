<script lang="ts">
  import { onDestroy } from 'svelte';
  import { omniWorker } from '@anonaddy/omni-worker';
  // @ts-expect-error Vite omniWorkerVite plugin transforms .worker.ts at build time
  import workerUrl from '../../shared/workers/math.worker.ts';
  import type { MathApi } from './types';
  import type { StatusState } from './appTypes';

  /** Callback for updating the global status bar. */
  export let setStatus: (state: StatusState, message: string) => void;

  let worker: ReturnType<typeof omniWorker<MathApi>> | null = null;
  let isAlive: boolean = false;
  let stateLabel: string = '';
  let resultText: string | null = null;
  let errorText: string | null = null;

  // Button states
  let destroyDisabled: boolean = true;
  let useDisabled: boolean = true;
  let running: boolean = false;

  onDestroy(() => {
    if (worker && !worker.isDestroyed()) {
      worker.destroy();
    }
    worker = null;
  });

  /** Create a new worker instance. */
  async function createWorker(): Promise<void> {
    resultText = null;
    errorText = null;

    // Destroy existing if any
    if (worker && !worker.isDestroyed()) {
      await worker.destroy();
    }

    try {
      worker = omniWorker<MathApi>('math', workerUrl as string);
      isAlive = true;
      stateLabel = 'Worker alive';
      destroyDisabled = false;
      useDisabled = false;
      setStatus('success', 'Worker created successfully');
    } catch (err) {
      errorText = err instanceof Error ? `Create failed: ${err.message}` : 'Create failed';
      setStatus('error', 'Worker creation failed');
    }
  }

  /** Destroy the current worker. */
  async function destroyWorker(): Promise<void> {
    resultText = null;
    errorText = null;

    if (!worker) {
      errorText = 'No worker to destroy';
      return;
    }

    try {
      await worker.destroy();
      isAlive = false;
      stateLabel = 'Worker destroyed';
      destroyDisabled = true;
      useDisabled = true;
      setStatus('idle', 'Worker destroyed');
    } catch (err) {
      errorText = err instanceof Error ? `Destroy failed: ${err.message}` : 'Destroy failed';
      setStatus('error', 'Worker destroy failed');
    }
  }

  /** Test the worker by calling add(100, 200). */
  async function testWorker(): Promise<void> {
    resultText = null;
    errorText = null;

    if (!worker) {
      errorText = 'No worker exists — create one first';
      setStatus('error', 'No worker to test');
      return;
    }

    const destroyed = worker.isDestroyed();
    if (destroyed) {
      errorText = 'Worker is destroyed (isDestroyed() = true). This is expected.';
      isAlive = false;
      stateLabel = 'Worker destroyed (confirmed)';
      return;
    }

    running = true;
    useDisabled = true;
    setStatus('running', 'Testing worker...');

    try {
      const result = await worker.use().add(100, 200);
      resultText = `Worker alive — add(100, 200) = ${result}`;
      setStatus('success', `Worker test passed (result: ${result})`);
    } catch (err) {
      errorText = err instanceof Error ? `Test failed: ${err.message}` : 'Test failed';
      setStatus('error', 'Worker test failed');
      useDisabled = false;
    } finally {
      running = false;
    }
  }
</script>

<h2 style="margin-top: 0">Lifecycle Demo</h2>

<p style="color: #555; font-size: 0.9rem">
  Demonstrates destroy() and isDestroyed(). Create a worker, check its state,
  destroy it, then try to use it.
</p>

<!-- Controls -->
<div class="control-group">
  <button
    class="btn"
    on:click={createWorker}
    aria-label="Create a new worker instance"
  >
    Create Worker
  </button>

  <button
    class="btn btn-danger"
    on:click={destroyWorker}
    disabled={destroyDisabled}
    aria-label="Destroy the current worker"
  >
    Destroy Worker
  </button>

  <button
    class="btn"
    on:click={testWorker}
    disabled={useDisabled || running}
    aria-label="Test if worker is alive"
  >
    Test Worker
  </button>
</div>

<!-- State indicator -->
<div aria-live="polite" aria-atomic="true">
  {#if stateLabel}
    <div class="state-indicator {isAlive ? 'alive' : 'destroyed'}">
      <span class="state-dot" aria-hidden="true"></span>
      <span>{stateLabel}</span>
    </div>
  {/if}
</div>

<!-- Result area -->
<div aria-live="assertive" role="alert">
  {#if running}
    <div class="status-footer state-running">
      <span class="spinner" aria-hidden="true"></span> Testing worker...
    </div>
  {/if}

  {#if resultText}
    <div class="result-box">{resultText}</div>
  {/if}

  {#if errorText}
    <div class="error-box">{errorText}</div>
  {/if}
</div>
