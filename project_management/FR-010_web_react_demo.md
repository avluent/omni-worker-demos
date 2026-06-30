# FR-010: Web — React Demo Application

| Field | Value |
|-------|-------|
| **ID** | FR-010 |
| **Title** | Web — React Demo Application |
| **Category** | Web Demo |
| **Created** | 2026-06-30T00:00:00.000Z |
| **Last Updated** | 2026-06-30T00:00:00.000Z |
| **Priority** | High |

## Description

As a React developer, I want a React-based demo application showing omni-worker integration with React's rendering model, so that I understand how to use workers within React components and hooks.

## Definition of Done

- [ ] Vite + React project at `web-react/` with TypeScript
- [ ] Single-page app with tabbed navigation (same tabs as vanilla)
- [ ] Custom hook: `useOmniWorker<T>()` — manages worker lifecycle
- [ ] Custom hook: `useOmniWorkerPool<T>()` — manages pool lifecycle
- [ ] Tab: Single Worker — input fields, result display with React state
- [ ] Tab: Worker Pool — progress visualization with React state
- [ ] Tab: Error Handling — error boundary + OmniWorkerError display
- [ ] Tab: Lifecycle — visual state machine display
- [ ] Workers destroyed in `useEffect` cleanup
- [ ] Shared worker definitions from `shared/workers/`

## Specification

### Component Architecture

```
┌─────────────────────────────────────┐
│  App.tsx                            │
│  ┌───────────────────────────────┐  │
│  │  TabBar (tabs prop)           │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  TabContent (activeTab)       │  │
│  │  ├── SingleWorkerTab          │  │
│  │  ├── WorkerPoolTab            │  │
│  │  ├── ErrorHandlingTab         │  │
│  │  └── LifecycleTab             │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  StatusFooter                 │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Custom Hooks

#### useOmniWorker<T>(workerSource)

| Return Value | Type | Description |
|-------------|------|-------------|
| `worker` | `IOmniWorker<T> \| null` | Worker instance |
| `isReady` | `boolean` | Worker is initialized |
| `isDestroyed` | `boolean` | Worker has been destroyed |
| `destroy` | `() => void` | Destroy worker |

#### useOmniWorkerPool<T>(workerSource, count)

| Return Value | Type | Description |
|-------------|------|-------------|
| `pool` | `IOmniWorkerPool<T> \| null` | Pool instance |
| `workerCount` | `number` | Number of workers |
| `isReady` | `boolean` | Pool is initialized |
| `isDestroyed` | `boolean` | Pool has been destroyed |
| `destroy` | `() => void` | Destroy pool |

### Tab Components

Each tab component:
1. Uses appropriate hook to get worker/pool
2. Has React state for inputs, results, loading, errors
3. Renders controls and output
4. Cleans up worker in `useEffect` return

### State Management

```
useState for:
  - activeTab: string
  - inputValues: Record<string, string>
  - results: Record<string, any>
  - loading: boolean
  - error: OmniWorkerError | null
```

### Visual Design

Same visual feedback as vanilla demo:

| State | React Rendering |
|-------|----------------|
| Idle | Disabled button, "Ready" text |
| Running | `loading={true}` → spinner, disabled inputs |
| Success | Green result box, `results` state populated |
| Error | Red error box, `error` state populated |

### Cleanup Pattern

```tsx
useEffect(() => {
  const worker = omniWorker<MathApi>(path, source);
  return () => { worker.destroy(); };
}, []);
```

### Exceptions

- React Error Boundary wraps each tab component
- `OmniWorkerError` caught and displayed in error tab
- Cleanup always called in `useEffect` return

### Tests

| Test | Assertion |
|------|-----------|
| App renders | All tabs visible, no React errors |
| Hook lifecycle | Worker created on mount, destroyed on unmount |
| State updates | Results appear in DOM after worker call |
| Error boundary | Catches and displays worker errors |
| Cleanup | No zombie workers after component unmount |
