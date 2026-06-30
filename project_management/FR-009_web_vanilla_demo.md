# FR-009: Web — Vanilla JS Demo Application

| Field | Value |
|-------|-------|
| **ID** | FR-009 |
| **Title** | Web — Vanilla JS Demo Application |
| **Category** | Web Demo |
| **Created** | 2026-06-30T00:00:00.000Z |
| **Last Updated** | 2026-06-30T00:00:00.000Z |
| **Priority** | High |

## Description

As a web developer, I want a vanilla JavaScript demo application with a tabbed interface, so that I can see omni-worker working in a browser environment without any framework overhead.

## Definition of Done

- [ ] Vite project at `web-vanilla/` with TypeScript
- [ ] Single-page app with tabbed navigation
- [ ] Tab: Single Worker — demonstrates `omniWorker<T>()` with visual feedback
- [ ] Tab: Worker Pool — demonstrates `omniWorkerPool<T>()` with progress visualization
- [ ] Tab: Error Handling — demonstrates `OmniWorkerError` display
- [ ] Tab: Lifecycle — demonstrates `destroy()` and `isDestroyed()` UI
- [ ] All worker results rendered to DOM
- [ ] Loading states shown during worker operations
- [ ] Error states displayed prominently
- [ ] Workers destroyed on page unload or tab switch

## Specification

### Page Structure

```
┌─────────────────────────────────────────┐
│         Omni Worker Web Demo            │
│                                         │
│  [Single Worker] [Pool] [Errors] [Life] │  ← Tab bar
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │     Active tab content            │  │
│  │     (worker controls + results)   │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Status: Worker running / idle / error  │
└─────────────────────────────────────────┘
```

### Tab Contents

| Tab | Feature | Controls | Output |
|-----|---------|----------|--------|
| Single Worker | `omniWorker<MathApi>()` | Input fields + "Run" button | Result display, timing |
| Worker Pool | `omniWorkerPool<HeavyApi>()` | "Run 8 tasks" button | Progress bars per task, timing |
| Error Handling | `OmniWorkerError` | "Trigger error" button | Error code, message, stack |
| Lifecycle | `destroy()`, `isDestroyed()` | "Create" / "Destroy" buttons | State indicator |

### Worker Creation

Each tab creates its own worker/pool instance. Workers are destroyed when switching tabs or on `window.beforeunload`.

### Visual Feedback

| State | Visual Indicator |
|-------|-----------------|
| Idle | Gray button, "Ready" text |
| Running | Spinner animation, "Computing..." text |
| Success | Green result box with value |
| Error | Red error box with message and code |

### DOM Structure

```html
<main>
  <nav role="tablist">
    <button role="tab" aria-selected="true">Single Worker</button>
    <button role="tab">Worker Pool</button>
    <button role="tab">Error Handling</button>
    <button role="tab">Lifecycle</button>
  </nav>
  <section role="tabpanel">
    <!-- Dynamic content per tab -->
  </section>
  <footer id="status">Ready</footer>
</main>
```

### Environment Detection

```
const isNode = typeof process !== 'undefined' && process.versions?.node;
// In browser: always false → uses workerUrl (data URL) for Web Workers
```

### Exceptions

- `UNSUPPORTED_ENVIRONMENT` — if browser doesn't support Web Workers
- `WORKER_CREATE_FAILED` — if worker URL is invalid
- `WORKER_ALREADY_DESTROYED` — if user clicks after destroying

### Tests

| Test | Assertion |
|------|-----------|
| Page loads | No console errors, tabs rendered |
| Single worker tab | Button click triggers worker call, result displayed |
| Pool tab | Progress visualization updates during task execution |
| Error tab | Error displayed with code and message |
| Lifecycle tab | State indicator updates correctly |
| Tab switch | Workers destroyed on tab switch |
| Accessibility | ARIA roles, keyboard navigation work |
