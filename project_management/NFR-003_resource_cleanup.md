# NFR-003: Resource Cleanup

| Field | Value |
|-------|-------|
| **ID** | NFR-003 |
| **Title** | Resource Cleanup Discipline |
| **Category** | Quality — Reliability |
| **Created** | 2026-06-30T00:00:00.000Z |
| **Last Updated** | 2026-06-30T00:00:00.000Z |
| **Priority** | High |

## Description

As a system, I want all worker resources to be properly cleaned up after use, so that there are no memory leaks or zombie worker threads.

## Definition of Done

- [ ] Every Node.js demo calls `worker.destroy()` or `pool.destroy()` in a `finally` block
- [ ] Every web demo destroys workers on tab switch and page unload
- [ ] React demos use `useEffect` cleanup for worker destruction
- [ ] Svelte demos use `onDestroy` for worker destruction
- [ ] Vanilla demo uses `window.beforeunload` and tab-switch cleanup
- [ ] No worker references held after destruction

## Specification

### Cleanup Patterns by Platform

#### Node.js Scripts

```
async function main() {
  const worker = omniWorker<Api>(path, source);
  try {
    // ... do work ...
  } finally {
    await worker.destroy();
  }
}
```

#### Vanilla JS

```
let workers = new Map<string, IOmniWorker<any>>();

function switchTab(tab) {
  // Destroy workers from previous tab
  workers.get(previousTab)?.destroy();
  workers.delete(previousTab);
  // Create new worker for new tab
}

window.addEventListener('beforeunload', () => {
  workers.forEach(w => w.destroy());
});
```

#### React

```
useEffect(() => {
  const worker = omniWorker<Api>(path, source);
  return () => { worker.destroy(); };
}, []);
```

#### Svelte

```
onMount(() => { worker = omniWorker<Api>(path, source); });
onDestroy(() => { worker?.destroy(); });
```

### Idempotency

Both `worker.destroy()` and `pool.destroy()` are idempotent (safe to call multiple times). This allows defensive cleanup patterns without double-destroy errors.

### Memory Management

| Resource | Cleanup Method | Timing |
|----------|---------------|--------|
| Node worker thread | `worker.terminate()` via `destroy()` | `finally` block |
| Browser Web Worker | `worker.terminate()` via `destroy()` | Tab switch / unload |
| Comlink proxy | Nullified by `destroy()` | Same as above |
| Pool workers | `Promise.all(destroy())` | Same as above |

### Compliance

ISO/IEC 25010 — Reliability: "Ability of a product or system to maintain its level of performance"

### Exceptions

- `destroy()` catches internal errors (best-effort cleanup)
- `window.unload` may not wait for async `destroy()` — fire-and-forget acceptable

### Tests

| Test | Assertion |
|------|-----------|
| Node.js cleanup | No orphan worker threads after script exit |
| Web tab switch | Workers destroyed when switching tabs (check `isDestroyed()`) |
| React unmount | Worker destroyed when component unmounts |
| Svelte destroy | Worker destroyed when component is replaced |
| Multiple destroy | Calling `destroy()` twice doesn't throw |
