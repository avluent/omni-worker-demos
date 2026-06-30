/**
 * Tab: Error Handling
 *
 * Demonstrates how OmniWorkerError is thrown and caught. Triggers
 * known error scenarios and displays the error code, message, and
 * optional cause information.
 *
 * @module tabs/errorHandlingTab
 */

import {
  omniWorker,
  OmniWorkerError,
  OmniWorkerErrorCodes,
} from '@anonaddy/omni-worker';
// @ts-expect-error Vite omniWorkerVite plugin transforms .worker.ts at build time
import workerUrl from '../../../shared/workers/math.worker.ts';
import type { MathApi } from '../types';
import type { TabModule, StatusCallback } from '../app';

/** Error scenarios that can be triggered for demonstration. */
interface ErrorScenario {
  id: string;
  label: string;
}

const SCENARIOS: ErrorScenario[] = [
  { id: 'destroyed-worker', label: 'Use Destroyed Worker' },
  {
    id: 'worker-from-worker',
    label: 'Create Worker (Worker thread)',
  },
];

/**
 * Manages worker error demonstration.
 */
export class ErrorHandlingTab implements TabModule {
  private tempWorker: ReturnType<typeof omniWorker<MathApi>> | null = null;

  async destroy(): Promise<void> {
    if (this.tempWorker && !this.tempWorker.isDestroyed()) {
      await this.tempWorker.destroy();
    }
    this.tempWorker = null;
  }

  render(panel: HTMLElement, onStatus: StatusCallback): void {
    // ── Heading ──
    const h2 = document.createElement('h2');
    h2.textContent = 'Error Handling Demo';
    h2.style.marginTop = '0';
    panel.appendChild(h2);

    // ── Description ──
    const desc = document.createElement('p');
    desc.textContent =
      'Demonstrates OmniWorkerError with machine-readable codes. Select a scenario to trigger an error.';
    desc.style.color = '#555';
    desc.style.fontSize = '0.9rem';
    panel.appendChild(desc);

    // ── Scenario selector ──
    const controls = document.createElement('div');
    controls.className = 'control-group';

    const groupScenario = document.createElement('div');
    groupScenario.className = 'input-field';
    const labelScenario = document.createElement('label');
    labelScenario.htmlFor = 'error-scenario';
    labelScenario.textContent = 'Scenario';
    const selectScenario = document.createElement('select');
    selectScenario.id = 'error-scenario';
    selectScenario.setAttribute('aria-label', 'Error scenario');
    for (const scenario of SCENARIOS) {
      const opt = document.createElement('option');
      opt.value = scenario.id;
      opt.textContent = scenario.label;
      selectScenario.appendChild(opt);
    }
    groupScenario.appendChild(labelScenario);
    groupScenario.appendChild(selectScenario);
    controls.appendChild(groupScenario);

    // Trigger button
    const btn = document.createElement('button');
    btn.className = 'btn btn-danger';
    btn.id = 'error-trigger';
    btn.textContent = 'Trigger Error';
    btn.setAttribute('aria-label', 'Trigger error scenario');
    controls.appendChild(btn);

    panel.appendChild(controls);

    // ── Error display area ──
    const errorArea = document.createElement('div');
    errorArea.id = 'error-display';
    errorArea.setAttribute('aria-live', 'assertive');
    errorArea.setAttribute('role', 'alert');
    panel.appendChild(errorArea);

    // ── Wire up click ──
    btn.addEventListener('click', async () => {
      await this.handleTrigger(
        selectScenario,
        btn,
        errorArea,
        onStatus,
      );
    });
  }

  activate(_panel: HTMLElement, _onStatus: StatusCallback): void {
    // No special activation needed
  }

  /* ── Handler ────────────────────────────────────────────────── */

  private async handleTrigger(
    selectScenario: HTMLSelectElement,
    btn: HTMLButtonElement,
    errorArea: HTMLElement,
    onStatus: StatusCallback,
  ): Promise<void> {
    errorArea.innerHTML = '';
    btn.disabled = true;
    onStatus('running', 'Triggering error scenario...');

    const scenario = selectScenario.value;

    try {
      switch (scenario) {
        case 'destroyed-worker': {
          await this.triggerDestroyedWorkerError();
          break;
        }
        case 'worker-from-worker': {
          await this.triggerWorkerCreationError();
          break;
        }
        default:
          throw new Error(`Unknown scenario: ${scenario}`);
      }
    } catch (err) {
      const box = document.createElement('div');
      box.className = 'error-box';

      let details = '';
      if (err instanceof OmniWorkerError) {
        details =
          `[OmniWorkerError] Code: ${err.code}\nMessage: ${err.message}`;
        if (err.cause) {
          details += `\nCause: ${err.cause.message}`;
        }
        if (err.workerPath) {
          details += `\nWorker: ${err.workerPath}`;
        }
        onStatus('error', `OmniWorkerError: ${err.code}`);
      } else if (err instanceof Error) {
        details = `[Error] ${err.message}`;
        onStatus('error', `Error: ${err.message}`);
      } else {
        details = 'An unexpected error occurred';
        onStatus('error', 'Unknown error');
      }

      box.textContent = details;
      errorArea.appendChild(box);
    } finally {
      btn.disabled = false;
    }
  }

  /**
   * Creates a worker, destroys it, then tries to use it — triggers
   * WORKER_ALREADY_DESTROYED.
   */
  private async triggerDestroyedWorkerError(): Promise<void> {
    this.tempWorker = omniWorker<MathApi>('math', workerUrl);
    // Destroy immediately
    await this.tempWorker.destroy();
    // Now try to use — should throw WORKER_ALREADY_DESTROYED
    try {
      await this.tempWorker.use().add(1, 2);
    } catch (err) {
      if (err instanceof Error) {
        // Re-throw so the caller can handle it
        throw err;
      }
    }
  }

  /**
   * Demonstrates a manually constructed OmniWorkerError to show
   * how the error class works.
   */
  private async triggerWorkerCreationError(): Promise<void> {
    // Simulate a worker creation failure scenario
    throw new OmniWorkerError(
      'Simulated worker creation failure for demonstration',
      {
        code: OmniWorkerErrorCodes.WORKER_CREATE_FAILED,
        workerPath: 'simulated.worker.ts',
      },
    );
  }
}
