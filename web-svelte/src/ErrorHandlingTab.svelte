<script lang="ts">
  import { onDestroy } from 'svelte';
  import {
    omniWorker,
    OmniWorkerError,
    OmniWorkerErrorCodes,
  } from '@anonaddy/omni-worker';
  // @ts-expect-error Vite omniWorkerVite plugin transforms .worker.ts at build time
  import workerUrl from '../../shared/workers/math.worker.ts';
  import type { MathApi } from './types';
  import type { StatusState } from './appTypes';

  /** Callback for updating the global status bar. */
  export let setStatus: (state: StatusState, message: string) => void;

  interface ErrorScenario {
    id: string;
    label: string;
  }

  const scenarios: ErrorScenario[] = [
    { id: 'destroyed-worker', label: 'Use Destroyed Worker' },
    {
      id: 'worker-from-worker',
      label: 'Create Worker (Worker thread)',
    },
  ];

  let tempWorker: ReturnType<typeof omniWorker<MathApi>> | null = null;
  let scenario: string = 'destroyed-worker';
  let errorDetails: string | null = null;
  let disabled: boolean = false;

  onDestroy(() => {
    if (tempWorker && !tempWorker.isDestroyed()) {
      tempWorker.destroy();
    }
    tempWorker = null;
  });

  /** Trigger the selected error scenario. */
  async function trigger(): Promise<void> {
    errorDetails = null;
    disabled = true;
    setStatus('running', 'Triggering error scenario...');

    try {
      switch (scenario) {
        case 'destroyed-worker':
          await triggerDestroyedWorkerError();
          break;
        case 'worker-from-worker':
          await triggerWorkerCreationError();
          break;
        default:
          throw new Error(`Unknown scenario: ${scenario}`);
      }
    } catch (err) {
      if (err instanceof OmniWorkerError) {
        let details = `[OmniWorkerError] Code: ${err.code}\nMessage: ${err.message}`;
        if (err.cause) {
          details += `\nCause: ${err.cause.message}`;
        }
        if (err.workerPath) {
          details += `\nWorker: ${err.workerPath}`;
        }
        errorDetails = details;
        setStatus('error', `OmniWorkerError: ${err.code}`);
      } else if (err instanceof Error) {
        errorDetails = `[Error] ${err.message}`;
        setStatus('error', `Error: ${err.message}`);
      } else {
        errorDetails = 'An unexpected error occurred';
        setStatus('error', 'Unknown error');
      }
    } finally {
      disabled = false;
    }
  }

  /**
   * Creates a worker, destroys it, then tries to use it — triggers
   * WORKER_ALREADY_DESTROYED.
   */
  async function triggerDestroyedWorkerError(): Promise<void> {
    tempWorker = omniWorker<MathApi>('math', workerUrl as string);
    await tempWorker.destroy();
    try {
      await tempWorker.use().add(1, 2);
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
    }
  }

  /**
   * Demonstrates a manually constructed OmniWorkerError.
   */
  async function triggerWorkerCreationError(): Promise<void> {
    throw new OmniWorkerError(
      'Simulated worker creation failure for demonstration',
      {
        code: OmniWorkerErrorCodes.WORKER_CREATE_FAILED,
        workerPath: 'simulated.worker.ts',
      },
    );
  }
</script>

<h2 style="margin-top: 0">Error Handling Demo</h2>

<p style="color: #555; font-size: 0.9rem">
  Demonstrates OmniWorkerError with machine-readable codes.
  Select a scenario to trigger an error.
</p>

<!-- Controls -->
<div class="control-group">
  <div class="input-field">
    <label for="error-scenario-svelte">Scenario</label>
    <select
      id="error-scenario-svelte"
      bind:value={scenario}
      aria-label="Error scenario"
    >
      {#each scenarios as s}
        <option value={s.id}>{s.label}</option>
      {/each}
    </select>
  </div>

  <button
    class="btn btn-danger"
    on:click={trigger}
    disabled={disabled}
    aria-label="Trigger error scenario"
  >
    Trigger Error
  </button>
</div>

<!-- Error display area -->
<div aria-live="assertive" role="alert">
  {#if errorDetails}
    <div class="error-box">{errorDetails}</div>
  {/if}
</div>
