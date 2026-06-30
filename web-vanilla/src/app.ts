/**
 * Omni Worker Web Demo — Application controller.
 *
 * Manages tab navigation (WAI-ARIA tab pattern), lazy-creates workers
 * per tab, and destroys workers when switching tabs or on page unload.
 *
 * @module app
 */

import { SingleWorkerTab } from './tabs/singleWorkerTab';
import { WorkerPoolTab } from './tabs/workerPoolTab';
import { ErrorHandlingTab } from './tabs/errorHandlingTab';
import { LifecycleTab } from './tabs/lifecycleTab';

/** Identifiers and labels for each application tab. */
interface TabDefinition {
  id: string;
  label: string;
}

/** All tabs registered with the application. */
const TABS: TabDefinition[] = [
  { id: 'single-worker', label: 'Single Worker' },
  { id: 'worker-pool', label: 'Worker Pool' },
  { id: 'error-handling', label: 'Error Handling' },
  { id: 'lifecycle', label: 'Lifecycle' },
];

type StatusState = 'idle' | 'running' | 'success' | 'error';

/** Callback signature for updating the global status bar. */
export type StatusCallback = (state: StatusState, message: string) => void;

/**
 * Tab content renderer — factory function per tab.
 */
export interface TabModule {
  /** Render the tab's content into the panel element. */
  render(panel: HTMLElement, onStatus: StatusCallback): void;
  /** Return a reference to destroy workers owned by this tab. */
  destroy(): Promise<void>;
  /** Called when this tab becomes active. */
  activate(panel: HTMLElement, onStatus: StatusCallback): void;
}

/**
 * Main application controller.
 */
export class App {
  private readonly root: HTMLElement;
  private activeTabId: string = TABS[0].id;
  private readonly tabModules: Map<string, TabModule> = new Map();
  private readonly tabButtons: HTMLButtonElement[] = [];
  private readonly panels: HTMLElement[] = [];
  private statusEl: HTMLElement | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  /** Build the DOM tree and wire up event listeners. */
  init(): void {
    this.render();
    this.initTabModules();
    this.initKeyboardNavigation();
    this.initUnloadHandler();
    // Activate the default tab
    this.activateTab(TABS[0].id);
  }

  /* ── Rendering ──────────────────────────────────────────────── */

  private render(): void {
    const main = document.createElement('main');
    main.className = 'app-container';
    main.id = 'tab-content';

    // Skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#tab-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to content';
    main.appendChild(skipLink);

    // Header
    const header = document.createElement('header');
    header.className = 'app-header';
    header.innerHTML =
      '<h1>Omni Worker — Web Demo</h1>' +
      '<p>Vanilla JavaScript demo using <code>omniWorker()</code> and <code>omniWorkerPool()</code></p>';
    main.appendChild(header);

    // Tab list
    const tabList = document.createElement('nav');
    tabList.setAttribute('role', 'tablist');
    tabList.setAttribute('aria-label', 'Demo sections');
    tabList.className = 'tablist';

    for (const tab of TABS) {
      const btn = document.createElement('button');
      btn.className = 'tab';
      btn.id = `tab-${tab.id}`;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', 'false');
      btn.setAttribute('aria-controls', `panel-${tab.id}`);
      btn.setAttribute('tabindex', '-1');
      btn.textContent = tab.label;
      btn.addEventListener('click', () => this.switchTab(tab.id));
      tabList.appendChild(btn);
      this.tabButtons.push(btn);
    }
    main.appendChild(tabList);

    // Tab panels
    for (const tab of TABS) {
      const panel = document.createElement('section');
      panel.className = 'tabpanel';
      panel.id = `panel-${tab.id}`;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', `tab-${tab.id}`);
      panel.setAttribute('tabindex', '0');
      panel.hidden = true;
      panel.dataset.tabId = tab.id;
      main.appendChild(panel);
      this.panels.push(panel);
    }

    // Status footer
    const status = document.createElement('footer');
    status.id = 'status';
    status.className = 'status-footer';
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    status.textContent = 'Ready';
    main.appendChild(status);
    this.statusEl = status;

    this.root.appendChild(main);
  }

  /* ── Tab Module Registry ────────────────────────────────────── */

  private initTabModules(): void {
    this.tabModules.set('single-worker', new SingleWorkerTab());
    this.tabModules.set('worker-pool', new WorkerPoolTab());
    this.tabModules.set('error-handling', new ErrorHandlingTab());
    this.tabModules.set('lifecycle', new LifecycleTab());
  }

  /* ── Tab Switching ──────────────────────────────────────────── */

  private switchTab(tabId: string): void {
    if (tabId === this.activeTabId) return;

    // Destroy previous tab workers
    const prevModule = this.tabModules.get(this.activeTabId);
    if (prevModule) {
      prevModule.destroy();
    }

    this.activeTabId = tabId;

    // Update ARIA
    for (let i = 0; i < TABS.length; i++) {
      const isActive = TABS[i].id === tabId;
      this.tabButtons[i].setAttribute('aria-selected', String(isActive));
      this.tabButtons[i].tabIndex = isActive ? 0 : -1;
      this.panels[i].hidden = !isActive;
    }

    const label = tabId.replace(/-/g, ' ');
    this.setStatus('idle', `${label} tab selected`);
    this.activateTab(tabId);
  }

  private activateTab(tabId: string): void {
    const panel = document.getElementById(`panel-${tabId}`);
    if (!panel) return;

    // Clear previous content if any
    panel.innerHTML = '';

    const module = this.tabModules.get(tabId);
    if (module) {
      module.render(panel, this.setStatus.bind(this));
      module.activate(panel, this.setStatus.bind(this));
    }
  }

  /* ── Status ─────────────────────────────────────────────────── */

  /**
   * Update the status bar with a state and message.
   * @param state - Visual state class
   * @param message - Text to display
   */
  setStatus(state: StatusState, message: string): void {
    if (!this.statusEl) return;
    this.statusEl.className = `status-footer state-${state}`;
    if (state === 'running') {
      this.statusEl.innerHTML =
        '<span class="spinner" aria-hidden="true"></span> ' + message;
    } else {
      this.statusEl.textContent = message;
    }
  }

  /* ── Keyboard Navigation ────────────────────────────────────── */

  private initKeyboardNavigation(): void {
    const tabList = this.root.querySelector<HTMLElement>(
      '[role="tablist"]',
    );
    if (!tabList) return;

    tabList.addEventListener(
      'keydown',
      (e: KeyboardEvent): void => {
      const currentIndex = this.tabButtons.findIndex(
        (btn) => btn === document.activeElement,
      );
      if (currentIndex === -1) return;

      let nextIndex: number = -1;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = (currentIndex + 1) % this.tabButtons.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextIndex =
            (currentIndex - 1 + this.tabButtons.length) %
            this.tabButtons.length;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = this.tabButtons.length - 1;
          break;
        case 'Escape':
          // Dismiss any active modal or error (handled by tab modules)
          e.preventDefault();
          return;
        default:
          return;
      }

      if (nextIndex >= 0) {
        this.tabButtons[nextIndex].focus();
        this.switchTab(TABS[nextIndex].id);
      }
    });
  }

  /* ── Page Unload ────────────────────────────────────────────── */

  private initUnloadHandler(): void {
    window.addEventListener('beforeunload', async () => {
      for (const module of this.tabModules.values()) {
        await module.destroy();
      }
    });
  }
}
