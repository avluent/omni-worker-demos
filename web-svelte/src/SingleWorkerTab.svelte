<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { omniWorker } from '@anonaddy/omni-worker';
  // @ts-expect-error Vite omniWorkerVite plugin transforms .worker.ts at build time
  import workerUrl from '../../shared/workers/math.worker.ts';
  import type { MathApi } from './types';
  import type { StatusState } from './appTypes';

  /** Callback for updating the global status bar. */
  export let setStatus: (state: StatusState, message: string) => void;

  let worker: ReturnType<typeof omniWorker<MathApi>> | null = null;
  let inputA: string = '42';
  let inputB: string = '58';
  let operation: keyof MathApi = 'add';
  let status: StatusState = 'idle';
  let result: string | null = null;
  let error: string | null = null;
  let disabled: boolean = false;

  const operations: Record<string, keyof MathApi> = {
    add: 'add',
    subtract: 'subtract',
    multiply: 'multiply',
    factorial: 'factorial',
  };

  onMount(() => {
    worker = omniWorker<MathApi>('math', workerUrl as string);
    status = 'idle';
    setStatus('idle', 'Single Worker tab ready');
  });

  onDestroy(() => {
    if (worker && !worker.isDestroyed()) {
      worker.destroy();
    }
    worker = null;
  });

  /** Execute the selected math operation. */
  async function run(): Promise<void> {
    result = null;
    error = null;
    disabled = true;
    status = 'running';
    setStatus('running', 'Computing...');

    const a = parseFloat(inputA);
    const b = parseFloat(inputB);
    const op = operation;

    try {
      const w = worker;
      if (!w || w.isDestroyed()) {
        worker = omniWorker<MathApi>('math', workerUrl as string);
      }

      const start = performance.now();
      let res: number;

      if (op === 'factorial') {
        res = await worker!.use().factorial(a);
      } else {
        res = await (worker!.use()[op] as (a: number, b: number) => Promise<number>)(a, b);
      }

      const elapsed = (performance.now() - start).toFixed(2);
      result = `Result: ${res}\nTime: ${elapsed}ms`;
      status = 'success';
      setStatus('success', `Math "${op}" completed in ${elapsed}ms`);
    } catch (err) {
      error = err instanceof Error ? err.message : 'An unexpected error occurred';
      status = 'error';
      setStatus('error', `Math operation failed: ${err}`);
    } finally {
      disabled = false;
    }
  }
</script>

<h2 style="margin-top: 0">Single Worker Demo</h2>

<p style="color: #555; font-size: 0.9rem">
  Uses omniWorker&lt;MathApi&gt;() — a single Web Worker with Comlink proxy.
  Enter two numbers and pick an operation.
</p>

<!-- Controls -->
<div class="control-group">
  <div class="input-field">
    <label for="math-a-svelte">A</label>
    <input
      type="number"
      id="math-a-svelte"
      bind:value={inputA}
      aria-label="First operand"
    />
  </div>

  <div class="input-field">
    <label for="math-b-svelte">B</label>
    <input
      type="number"
      id="math-b-svelte"
      bind:value={inputB}
      aria-label="Second operand"
    />
  </div>

  <div class="input-field">
    <label for="math-op-svelte">Operation</label>
    <select id="math-op-svelte" bind:value={operation} aria-label="Math operation">
      {#each Object.entries(operations) as [key, value]}
        <option value={value}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
      {/each}
    </select>
  </div>

  <button class="btn" on:click={run} disabled={disabled} aria-label="Execute math operation">
    Run
  </button>
</div>

<!-- Result area -->
<div aria-live="polite" aria-atomic="true">
  {#if status === 'running'}
    <div class="result-box">
      <span class="spinner" aria-hidden="true"></span> Computing...
    </div>
  {/if}

  {#if result}
    <div class="result-box" role="status">{result}</div>
  {/if}

  {#if error}
    <div class="error-box" role="alert">{error}</div>
  {/if}
</div>
