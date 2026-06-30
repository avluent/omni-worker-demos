# FR-011: Web — Svelte Demo Application

| Field | Value |
|-------|-------|
| **ID** | FR-011 |
| **Title** | Web — Svelte Demo Application |
| **Category** | Web Demo |
| **Created** | 2026-06-30T00:00:00.000Z |
| **Last Updated** | 2026-06-30T00:00:00.000Z |
| **Priority** | High |

## Description

As a Svelte developer, I want a Svelte-based demo application showing omni-worker integration with Svelte's fine-grained reactivity, so that I understand how to use workers within Svelte components and stores.

## Definition of Done

- [ ] Vite + Svelte project at `web-svelte/` with TypeScript
- [ ] Single-page app with tabbed navigation (same tabs as vanilla/React)
- [ ] Svelte stores for worker state management
- [ ] Tab: Single Worker — reactive inputs, reactive results
- [ ] Tab: Worker Pool — reactive progress visualization
- [ ] Tab: Error Handling — reactive error display
- [ ] Tab: Lifecycle — reactive state indicator
- [ ] Workers destroyed on `onDestroy` lifecycle hook
- [ ] Shared worker definitions from `shared/workers/`

## Specification

### Component Architecture

```
┌─────────────────────────────────────┐
│  App.svelte                         │
│  ┌───────────────────────────────┐  │
│  │  TabBar {tabs, activeTab}     │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  {#if activeTab === 'single'} │  │
│  │    SingleWorkerTab            │  │
│  │  {:else if ...}               │  │
│  │    WorkerPoolTab              │  │
│  │    ErrorHandlingTab           │  │
│  │    LifecycleTab               │  │
│  │  {/if}                        │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  StatusFooter {status}        │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Svelte Stores

```typescript
// stores/worker.ts
import { writable } from 'svelte/store';

export const workerState = writable({
  status: 'idle' as 'idle' | 'loading' | 'success' | 'error',
  result: null as any,
  error: null as Error | null,
});
```

### Tab Components

Each Svelte tab component:
1. Uses `onMount` to create worker/pool
2. Uses `onDestroy` to destroy worker/pool
3. Uses Svelte reactive statements for UI updates
4. Uses stores for shared state when needed

### Reactive Pattern

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { omniWorker } from '@anonaddy/omni-worker';
  
  let worker: IOmniWorker<MathApi> | null = null;
  let status = 'idle';
  let result = '';
  let error: Error | null = null;
  
  onMount(() => {
    worker = omniWorker<MathApi>(path, source);
  });
  
  onDestroy(() => {
    worker?.destroy();
  });
  
  async function run() {
    status = 'loading';
    try {
      result = await worker!.use().add(a, b);
      status = 'success';
    } catch (err) {
      error = err;
      status = 'error';
    }
  }
</script>
```

### Visual Feedback

| State | Svelte Rendering |
|-------|-----------------|
| Idle | `{#if status === 'idle'}...` |
| Loading | Spinner with `#await` block or conditional |
| Success | Green result box, `$: result` reactive |
| Error | Red error box, error details |

### Lifecycle Management

| Hook | Action |
|------|--------|
| `onMount` | Create worker/pool instance |
| `onDestroy` | Call `destroy()` on worker/pool |
| Tab switch | Previous tab's `onDestroy` runs |

### Exceptions

- Error states managed via Svelte reactive variables
- No Error Boundary equivalent — use try/catch in async functions
- Cleanup in `onDestroy` always called on tab switch

### Tests

| Test | Assertion |
|------|-----------|
| App renders | All tabs visible, no Svelte errors |
| Lifecycle hooks | Worker created on mount, destroyed on unmount |
| Reactive updates | Results appear in DOM after worker call |
| Error handling | Error displayed in error state |
| Cleanup | No zombie workers after tab switch |
