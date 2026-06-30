<script lang="ts">
  import { tick } from 'svelte';
  import SingleWorkerTab from './SingleWorkerTab.svelte';
  import WorkerPoolTab from './WorkerPoolTab.svelte';
  import ErrorHandlingTab from './ErrorHandlingTab.svelte';
  import LifecycleTab from './LifecycleTab.svelte';
  import type { StatusState } from './appTypes';

  /** Identifiers and labels for each application tab. */
  interface TabDefinition {
    id: string;
    label: string;
  }

  const TABS: TabDefinition[] = [
    { id: 'single-worker', label: 'Single Worker' },
    { id: 'worker-pool', label: 'Worker Pool' },
    { id: 'error-handling', label: 'Error Handling' },
    { id: 'lifecycle', label: 'Lifecycle' },
  ];

  /** Reactive status state. */
  let statusState: StatusState = 'idle';
  let statusMessage: string = 'Ready';

  /** Reactive active tab. */
  let activeTab: string = TABS[0].id;

  /**
   * Update the global status bar.
   * @param state - Visual state class
   * @param message - Text to display
   */
  function setStatus(state: StatusState, message: string): void {
    statusState = state;
    statusMessage = message;
  }

  /** Handle tab selection. */
  function switchTab(tabId: string): void {
    activeTab = tabId;
    const label = tabId.replace(/-/g, ' ');
    setStatus('idle', `${label} tab selected`);
  }

  /** Focus the tab button with the given ID. */
  async function focusTab(tabId: string): Promise<void> {
    // Wait for Svelte to update the DOM so tabindex reflects the new active tab
    await tick();
    const tabEl = document.getElementById(`tab-${tabId}`);
    if (tabEl) {
      tabEl.focus();
    }
  }

  /** Keyboard navigation handler for the tablist. */
  async function handleTabKeydown(e: KeyboardEvent): Promise<void> {
    const currentIndex = TABS.findIndex((t) => t.id === activeTab);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = (currentIndex + 1) % TABS.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = TABS.length - 1;
        break;
      case 'Escape':
        e.preventDefault();
        return;
      default:
        return;
    }

    if (nextIndex !== null) {
      const nextTabId = TABS[nextIndex].id;
      switchTab(nextTabId);
      // Move focus to the newly active tab (WAI-ARIA tab pattern)
      await focusTab(nextTabId);
    }
  }
</script>

<main class="app-container" id="tab-content">
  <!-- Skip link for accessibility -->
  <a href="#tab-content" class="skip-link">Skip to content</a>

  <!-- Header -->
  <header class="app-header">
    <h1>Omni Worker — Svelte Demo</h1>
    <p>Svelte SPA demo using <code>omniWorker()</code> and <code>omniWorkerPool()</code></p>
  </header>

  <!-- Tab list -->
  <div role="tablist" aria-label="Demo sections" class="tablist" aria-orientation="horizontal">
    {#each TABS as tab (tab.id)}
      <button
        class="tab"
        id="tab-{tab.id}"
        role="tab"
        aria-selected={activeTab === tab.id}
        aria-controls="panel-{tab.id}"
        tabindex={activeTab === tab.id ? 0 : -1}
        on:click={() => switchTab(tab.id)}
        on:keydown={handleTabKeydown}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <!-- Tab panels -->
  {#if activeTab === 'single-worker'}
    <div
      class="tabpanel"
      id="panel-single-worker"
      role="tabpanel"
      aria-labelledby="tab-single-worker"
      tabindex="0"
    >
      <SingleWorkerTab {setStatus} />
    </div>
  {:else if activeTab === 'worker-pool'}
    <div
      class="tabpanel"
      id="panel-worker-pool"
      role="tabpanel"
      aria-labelledby="tab-worker-pool"
      tabindex="0"
    >
      <WorkerPoolTab {setStatus} />
    </div>
  {:else if activeTab === 'error-handling'}
    <div
      class="tabpanel"
      id="panel-error-handling"
      role="tabpanel"
      aria-labelledby="tab-error-handling"
      tabindex="0"
    >
      <ErrorHandlingTab {setStatus} />
    </div>
  {:else if activeTab === 'lifecycle'}
    <div
      class="tabpanel"
      id="panel-lifecycle"
      role="tabpanel"
      aria-labelledby="tab-lifecycle"
      tabindex="0"
    >
      <LifecycleTab {setStatus} />
    </div>
  {/if}

  <!-- Status footer -->
  <footer
    class="status-footer state-{statusState}"
    aria-live="polite"
    aria-atomic="true"
  >
    {#if statusState === 'running'}
      <span class="spinner" aria-hidden="true"></span>
    {/if}
    {statusMessage}
  </footer>
</main>
