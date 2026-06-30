/**
 * Tab: Single Worker
 *
 * Demonstrates `omniWorker<MathApi>()` with input fields, a run button,
 * and a result display area. Shows visual feedback for each operation
 * state (idle → running → success/error).
 *
 * @module tabs/singleWorkerTab
 */

import { omniWorker } from '@anonaddy/omni-worker';
// @ts-expect-error Vite omniWorkerVite plugin transforms .worker.ts at build time
import workerUrl from '../../../shared/workers/math.worker.ts';
import type { MathApi } from '../types';
import type { TabModule, StatusCallback } from '../app';

/**
 * Possible human-readable states for the worker status indicator.
 */
type WorkerStatus = 'idle' | 'ready' | 'destroyed';

/**
 * Manages a single omniWorker instance for the math worker.
 */
export class SingleWorkerTab implements TabModule {
  private worker: ReturnType<typeof omniWorker<MathApi>> | null = null;
  private workerStatus: WorkerStatus = 'idle';
  private statusEl: HTMLElement | null = null;

  async destroy(): Promise<void> {
    if (this.worker && !this.worker.isDestroyed()) {
      await this.worker.destroy();
    }
    this.worker = null;
    this.workerStatus = 'destroyed';
    this.updateStatusDisplay();
  }

  /**
   * Updates the visual status indicator to reflect the current
   * worker state (idle / ready / destroyed).
   */
  private updateStatusDisplay(): void {
    if (!this.statusEl) return;

    const dot = this.statusEl.querySelector('.status-dot') as HTMLElement | null;
    const label = this.statusEl.querySelector('.status-label') as HTMLElement | null;

    if (dot) {
      dot.className = `status-dot ${this.workerStatus}`;
    }
    if (label) {
      label.textContent = this.workerStatus === 'ready'
        ? 'Worker alive'
        : this.workerStatus === 'destroyed'
          ? 'Worker destroyed'
          : 'Worker idle';
    }
  }

  render(panel: HTMLElement, onStatus: StatusCallback): void {
    // ── Heading ──
    const h2 = document.createElement('h2');
    h2.textContent = 'Single Worker Demo';
    h2.style.marginTop = '0';
    panel.appendChild(h2);

    // ── Status indicator ──
    const statusContainer = document.createElement('div');
    statusContainer.className = 'worker-status';
    statusContainer.id = 'worker-status';
    statusContainer.setAttribute('role', 'status');
    statusContainer.setAttribute('aria-live', 'polite');

    const statusDot = document.createElement('span');
    statusDot.className = 'status-dot idle';
    statusDot.setAttribute('aria-hidden', 'true');

    const statusLabel = document.createElement('span');
    statusLabel.className = 'status-label';
    statusLabel.textContent = 'Worker idle';

    statusContainer.appendChild(statusDot);
    statusContainer.appendChild(statusLabel);
    panel.appendChild(statusContainer);

    this.statusEl = statusContainer;
    this.workerStatus = 'idle';
    this.updateStatusDisplay();

    // ── Description ──
    const desc = document.createElement('p');
    desc.textContent =
      'Uses omniWorker<MathApi>() — a single Web Worker with Comlink proxy. Enter two numbers and pick an operation.';
    desc.style.color = '#555';
    desc.style.fontSize = '0.9rem';
    panel.appendChild(desc);

    // ── Input fields ──
    const controls = document.createElement('div');
    controls.className = 'control-group';

    // Number A
    const groupA = document.createElement('div');
    groupA.className = 'input-field';
    const labelA = document.createElement('label');
    labelA.htmlFor = 'math-a';
    labelA.textContent = 'A';
    const inputA = document.createElement('input');
    inputA.type = 'number';
    inputA.id = 'math-a';
    inputA.value = '42';
    inputA.setAttribute('aria-label', 'First operand');
    groupA.appendChild(labelA);
    groupA.appendChild(inputA);
    controls.appendChild(groupA);

    // Number B
    const groupB = document.createElement('div');
    groupB.className = 'input-field';
    const labelB = document.createElement('label');
    labelB.htmlFor = 'math-b';
    labelB.textContent = 'B';
    const inputB = document.createElement('input');
    inputB.type = 'number';
    inputB.id = 'math-b';
    inputB.value = '58';
    inputB.setAttribute('aria-label', 'Second operand');
    groupB.appendChild(labelB);
    groupB.appendChild(inputB);
    controls.appendChild(groupB);

    // Operation selector
    const groupOp = document.createElement('div');
    groupOp.className = 'input-field';
    const labelOp = document.createElement('label');
    labelOp.htmlFor = 'math-op';
    labelOp.textContent = 'Operation';
    const selectOp = document.createElement('select');
    selectOp.id = 'math-op';
    selectOp.setAttribute('aria-label', 'Math operation');
    const operations: Record<string, keyof MathApi> = {
      add: 'add',
      subtract: 'subtract',
      multiply: 'multiply',
      factorial: 'factorial',
    };
    for (const [label, key] of Object.entries(operations)) {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = label.charAt(0).toUpperCase() + label.slice(1);
      selectOp.appendChild(opt);
    }
    groupOp.appendChild(labelOp);
    groupOp.appendChild(selectOp);
    controls.appendChild(groupOp);

    // Run button
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.id = 'math-run';
    btn.textContent = 'Run';
    btn.setAttribute('aria-label', 'Execute math operation');
    controls.appendChild(btn);

    panel.appendChild(controls);

    // ── Result area ──
    const resultArea = document.createElement('div');
    resultArea.id = 'math-result';
    resultArea.setAttribute('aria-live', 'polite');
    resultArea.setAttribute('aria-atomic', 'true');
    panel.appendChild(resultArea);

    // ── Wire up click ──
    btn.addEventListener('click', async () => {
      await this.handleRun(
        inputA,
        inputB,
        selectOp,
        btn,
        resultArea,
        onStatus,
      );
    });
  }

  activate(_panel: HTMLElement, _onStatus: StatusCallback): void {
    // Worker is created on-demand when user clicks Run
  }

  /* ── Handler ────────────────────────────────────────────────── */

  private async handleRun(
    inputA: HTMLInputElement,
    inputB: HTMLInputElement,
    selectOp: HTMLSelectElement,
    btn: HTMLButtonElement,
    resultArea: HTMLElement,
    onStatus: StatusCallback,
  ): Promise<void> {
    // Reset
    resultArea.innerHTML = '';
    resultArea.className = '';
    btn.disabled = true;
    onStatus('running', 'Computing...');

    const a = parseFloat(inputA.value);
    const b = parseFloat(inputB.value);
    const op = selectOp.value as keyof MathApi;

    try {
      if (!this.worker || this.worker.isDestroyed()) {
        this.worker = omniWorker<MathApi>('math', workerUrl);
        console.log('[SingleWorkerTab] Worker created successfully');
      }

      this.workerStatus = 'ready';
      this.updateStatusDisplay();

      console.log(`[SingleWorkerTab] Calling task: ${op}(${a}, ${b})`);
      const start = performance.now();
      let result: number;

      switch (op) {
        case 'factorial':
          result = await this.worker.use().factorial(a);
          break;
        default:
          // add, subtract, multiply all accept (a, b)
          result = await (this.worker.use()[op] as (
            a: number,
            b: number,
          ) => Promise<number>)(a, b);
          break;
      }
      const elapsed = (performance.now() - start).toFixed(2);

      console.log(`[SingleWorkerTab] Task "${op}" completed: result=${result}, time=${elapsed}ms`);

      const box = document.createElement('div');
      box.className = 'result-box';
      box.textContent = `Result: ${result}\nTime: ${elapsed}ms`;
      resultArea.appendChild(box);

      onStatus('success', `Math "${op}" completed in ${elapsed}ms`);
    } catch (err) {
      const box = document.createElement('div');
      box.className = 'error-box';
      box.setAttribute('role', 'alert');
      if (err instanceof Error) {
        box.textContent = `Error: ${err.message}`;
      } else {
        box.textContent = 'An unexpected error occurred';
      }
      resultArea.appendChild(box);
      onStatus('error', `Math operation failed: ${err}`);
    } finally {
      btn.disabled = false;
    }
  }
}
