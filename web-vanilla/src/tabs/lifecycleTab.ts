/**
 * Tab: Lifecycle
 *
 * Demonstrates worker lifecycle management: `destroy()`, `isDestroyed()`,
 * and the ability to create and destroy workers on demand.
 *
 * @module tabs/lifecycleTab
 */

import { omniWorker } from '@anonaddy/omni-worker';
// @ts-expect-error Vite omniWorkerVite plugin transforms .worker.ts at build time
import workerUrl from '../../../shared/workers/math.worker.ts';
import type { MathApi } from '../types';
import type { TabModule, StatusCallback } from '../app';

/**
 * Manages a worker whose lifecycle the user controls.
 */
export class LifecycleTab implements TabModule {
  private worker: ReturnType<typeof omniWorker<MathApi>> | null = null;

  async destroy(): Promise<void> {
    if (this.worker && !this.worker.isDestroyed()) {
      await this.worker.destroy();
    }
    this.worker = null;
  }

  render(panel: HTMLElement, onStatus: StatusCallback): void {
    // ── Heading ──
    const h2 = document.createElement('h2');
    h2.textContent = 'Lifecycle Demo';
    h2.style.marginTop = '0';
    panel.appendChild(h2);

    // ── Description ──
    const desc = document.createElement('p');
    desc.textContent =
      'Demonstrates destroy() and isDestroyed(). Create a worker, check its state, destroy it, then try to use it.';
    desc.style.color = '#555';
    desc.style.fontSize = '0.9rem';
    panel.appendChild(desc);

    // ── Controls ──
    const controls = document.createElement('div');
    controls.className = 'control-group';

    // Create button
    const btnCreate = document.createElement('button');
    btnCreate.className = 'btn';
    btnCreate.id = 'lifecycle-create';
    btnCreate.textContent = 'Create Worker';
    btnCreate.setAttribute('aria-label', 'Create a new worker instance');
    controls.appendChild(btnCreate);

    // Destroy button
    const btnDestroy = document.createElement('button');
    btnDestroy.className = 'btn btn-danger';
    btnDestroy.id = 'lifecycle-destroy';
    btnDestroy.textContent = 'Destroy Worker';
    btnDestroy.disabled = true;
    btnDestroy.setAttribute('aria-label', 'Destroy the current worker');
    controls.appendChild(btnDestroy);

    // Use button (tries to call add after possible destroy)
    const btnUse = document.createElement('button');
    btnUse.className = 'btn';
    btnUse.id = 'lifecycle-use';
    btnUse.textContent = 'Test Worker';
    btnUse.disabled = true;
    btnUse.setAttribute('aria-label', 'Test if worker is alive');
    controls.appendChild(btnUse);

    panel.appendChild(controls);

    // ── State indicator ──
    const stateArea = document.createElement('div');
    stateArea.id = 'lifecycle-state';
    stateArea.setAttribute('aria-live', 'polite');
    stateArea.setAttribute('aria-atomic', 'true');
    panel.appendChild(stateArea);

    // ── Result area ──
    const resultArea = document.createElement('div');
    resultArea.id = 'lifecycle-result';
    resultArea.setAttribute('aria-live', 'assertive');
    resultArea.setAttribute('role', 'alert');
    panel.appendChild(resultArea);

    // ── Wire up ──
    btnCreate.addEventListener('click', async () => {
      await this.handleCreate(
        btnCreate,
        btnDestroy,
        btnUse,
        stateArea,
        resultArea,
        onStatus,
      );
    });

    btnDestroy.addEventListener('click', async () => {
      await this.handleDestroy(
        btnCreate,
        btnDestroy,
        btnUse,
        stateArea,
        resultArea,
        onStatus,
      );
    });

    btnUse.addEventListener('click', async () => {
      await this.handleUse(
        btnCreate,
        btnDestroy,
        btnUse,
        stateArea,
        resultArea,
        onStatus,
      );
    });
  }

  activate(_panel: HTMLElement, _onStatus: StatusCallback): void {
    // Reset UI when entering the tab
    const stateArea = document.getElementById('lifecycle-state');
    const resultArea = document.getElementById('lifecycle-result');
    const btnDestroy = document.getElementById(
      'lifecycle-destroy',
    ) as HTMLButtonElement | null;
    const btnUse = document.getElementById(
      'lifecycle-use',
    ) as HTMLButtonElement | null;

    if (stateArea) {
      stateArea.innerHTML = '';
    }
    if (resultArea) {
      resultArea.innerHTML = '';
    }
    if (btnDestroy) {
      btnDestroy.disabled = true;
    }
    if (btnUse) {
      btnUse.disabled = true;
    }
  }

  /* ── Handlers ───────────────────────────────────────────────── */

  private async handleCreate(
    _btnCreate: HTMLButtonElement,
    btnDestroy: HTMLButtonElement,
    btnUse: HTMLButtonElement,
    stateArea: HTMLElement,
    resultArea: HTMLElement,
    onStatus: StatusCallback,
  ): Promise<void> {
    resultArea.innerHTML = '';

    // Destroy existing if any
    if (this.worker && !this.worker.isDestroyed()) {
      await this.worker.destroy();
    }

    try {
      this.worker = omniWorker<MathApi>('math', workerUrl);

      btnDestroy.disabled = false;
      btnUse.disabled = false;

      updateState(stateArea, false, 'Worker alive');
      onStatus('success', 'Worker created successfully');
    } catch (err) {
      const box = document.createElement('div');
      box.className = 'error-box';
      box.textContent =
        err instanceof Error
          ? `Create failed: ${err.message}`
          : 'Create failed';
      resultArea.appendChild(box);
      onStatus('error', `Worker creation failed`);
    }
  }

  private async handleDestroy(
    _btnCreate: HTMLButtonElement,
    btnDestroy: HTMLButtonElement,
    btnUse: HTMLButtonElement,
    stateArea: HTMLElement,
    resultArea: HTMLElement,
    onStatus: StatusCallback,
  ): Promise<void> {
    resultArea.innerHTML = '';

    if (!this.worker) {
      const box = document.createElement('div');
      box.className = 'error-box';
      box.textContent = 'No worker to destroy';
      resultArea.appendChild(box);
      return;
    }

    try {
      await this.worker.destroy();
      btnDestroy.disabled = true;
      btnUse.disabled = true;
      updateState(stateArea, true, 'Worker destroyed');
      onStatus('idle', 'Worker destroyed');
    } catch (err) {
      const box = document.createElement('div');
      box.className = 'error-box';
      box.textContent =
        err instanceof Error
          ? `Destroy failed: ${err.message}`
          : 'Destroy failed';
      resultArea.appendChild(box);
      onStatus('error', 'Worker destroy failed');
    }
  }

  private async handleUse(
    _btnCreate: HTMLButtonElement,
    _btnDestroy: HTMLButtonElement,
    btnUse: HTMLButtonElement,
    stateArea: HTMLElement,
    resultArea: HTMLElement,
    onStatus: StatusCallback,
  ): Promise<void> {
    resultArea.innerHTML = '';

    if (!this.worker) {
      const box = document.createElement('div');
      box.className = 'error-box';
      box.textContent = 'No worker exists — create one first';
      resultArea.appendChild(box);
      onStatus('error', 'No worker to test');
      return;
    }

    // Check isDestroyed()
    const destroyed = this.worker.isDestroyed();
    if (destroyed) {
      const box = document.createElement('div');
      box.className = 'error-box';
      box.textContent =
        'Worker is destroyed (isDestroyed() = true). This is expected.';
      resultArea.appendChild(box);
      updateState(stateArea, true, 'Worker destroyed (confirmed)');
      return;
    }

    btnUse.disabled = true;
    onStatus('running', 'Testing worker...');

    try {
      const result = await this.worker.use().add(100, 200);
      const box = document.createElement('div');
      box.className = 'result-box';
      box.textContent = `Worker alive — add(100, 200) = ${result}`;
      resultArea.appendChild(box);
      onStatus('success', `Worker test passed (result: ${result})`);
    } catch (err) {
      const box = document.createElement('div');
      box.className = 'error-box';
      box.textContent =
        err instanceof Error
          ? `Test failed: ${err.message}`
          : 'Test failed';
      resultArea.appendChild(box);
      onStatus('error', 'Worker test failed');
      btnUse.disabled = false;
    }
  }

}

/**
 * Helper to update the lifecycle state indicator.
 * Lives at module level so it can be called from closures inside class methods.
 */
function updateState(
  stateArea: HTMLElement,
  isDestroyed: boolean,
  label: string,
): void {
  stateArea.innerHTML = '';
  const indicator = document.createElement('div');
  indicator.className = `state-indicator ${isDestroyed ? 'destroyed' : 'alive'}`;

  const dot = document.createElement('span');
  dot.className = 'state-dot';
  indicator.appendChild(dot);

  const text = document.createElement('span');
  text.textContent = label;
  indicator.appendChild(text);

  stateArea.appendChild(indicator);
}
