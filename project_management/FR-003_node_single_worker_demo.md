# FR-003: Node.js — Single Worker Demo

| Field | Value |
|-------|-------|
| **ID** | FR-003 |
| **Title** | Node.js — Single Worker Demo |
| **Category** | Node.js Demo |
| **Created** | 2026-06-30T00:00:00.000Z |
| **Last Updated** | 2026-06-30T00:00:00.000Z |
| **Priority** | High |

## Description

As a developer learning omni-worker, I want a simple Node.js script that creates a single worker and calls its methods, so that I can see the basic worker offload pattern in action.

## Definition of Done

- [ ] Script file: `node-demos/demos/01_single_worker.ts`
- [ ] Uses `omniWorker<MathApi>()` with math worker
- [ ] Calls at least 3 different API methods
- [ ] Logs results to stdout with clear labels
- [ ] Calls `worker.destroy()` in a `finally` block
- [ ] Runnable via `npx tsx node-demos/demos/01_single_worker.ts`

## Specification

### Script Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Import      │────▶│  omniWorker  │────▶│  worker.use()│
│  worker      │     │  <MathApi>() │     │  .add(1, 2)  │
│  + types     │     │              │     │  .factorial()│
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                          ┌───────▼────────┐
                                          │  Log results   │
                                          │  to stdout     │
                                          └───────┬────────┘
                                                  │
                                          ┌───────▼────────┐
                                          │  worker.destroy│
                                          │  (finally)     │
                                          └────────────────┘
```

### Output Format

```
=== Single Worker Demo ===
add(10, 25) = 35
subtract(100, 37) = 63
multiply(8, 7) = 56
factorial(10) = 3628800
Worker destroyed.
```

### Environment Detection

The script uses the auto-detection pattern:

| Variable | Detection Logic |
|----------|----------------|
| `isNode` | `typeof process !== 'undefined' && process.versions?.node` |
| `workerSource` | `isNode ? code : workerUrl` from Vite plugin import |

### Exceptions

- `WORKER_CREATE_FAILED` — logged with stack trace, graceful exit
- `WORKER_ALREADY_DESTROYED` — should not occur with proper finally block
- `OmniWorkerError` (generic) — caught, logged, exit code 1

### Tests

| Test | Assertion |
|------|-----------|
| Script runs | Exit code 0 |
| Output contains results | stdout matches expected values |
| Worker destroyed | "Worker destroyed" message in output |
| Error on invalid call | Non-zero exit if worker method fails |
