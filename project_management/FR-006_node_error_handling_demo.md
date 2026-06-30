# FR-006: Node.js — Error Handling Demo

| Field | Value |
|-------|-------|
| **ID** | FR-006 |
| **Title** | Node.js — Error Handling Demo |
| **Category** | Node.js Demo |
| **Created** | 2026-06-30T00:00:00.000Z |
| **Last Updated** | 2026-06-30T00:00:00.000Z |
| **Priority** | Medium |

## Description

As a developer, I want to see a demo that triggers and handles different OmniWorkerError codes, so that I understand the error handling capabilities of the library.

## Definition of Done

- [ ] Script file: `node-demos/demos/04_error_handling.ts`
- [ ] Demonstrates at least 3 different error codes
- [ ] Catches and displays `OmniWorkerError.code`, `workerPath`, and `cause`
- [ ] Shows `OmniWorkerError.toString()` formatted output
- [ ] Uses `instanceof OmniWorkerError` for type-safe catching

## Specification

### Error Scenarios

| Error Code | How to Trigger | Expected Behavior |
|------------|---------------|-------------------|
| `WORKER_ALREADY_DESTROYED` | Call `worker.use()` after `worker.destroy()` | Error with code and worker path |
| `WORKER_CREATE_FAILED` | Create worker with invalid source (if possible) or use uninitialized worker | Error with initialization message |
| `MISSING_API_EXPORT` | Use a worker file without `export const api` | Caught by Vite plugin at build time |

### Script Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Import error    │────▶│  Create worker   │────▶│  Normal use()    │
│  classes         │     │                  │     │  (succeeds)      │
└──────────────────┘     └────────┬─────────┘     └────────┬─────────┘
                                  │                         │
                         ┌────────▼─────────┐     ┌─────────▼────────┐
                         │  worker.destroy()│────▶│  worker.use()    │
                         │  (destroy first) │     │  (triggers error)│
                         └──────────────────┘     └────────┬─────────┘
                                                           │
                                                  ┌────────▼─────────┐
                                                  │  Catch with      │
                                                  │  instanceof      │
                                                  │  OmniWorkerError │
                                                  │  Log .code,      │
                                                  │  .toString()     │
                                                  └──────────────────┘
```

### Output Format

```
=== Error Handling Demo ===

[1] Normal operation (should succeed):
    add(5, 3) = 8 ✓

[2] Using destroyed worker (should fail):
    Destroying worker...
    Attempting to use destroyed worker...
    ✗ OmniWorkerError caught:
      code: WORKER_ALREADY_DESTROYED
      workerPath: ./math.worker.ts
      formatted: [OmniWorkerError:WORKER_ALREADY_DESTROYED] Cannot use worker...

Error handling demonstration complete.
```

### Type-Safe Error Handling

```
try {
  worker.use().someMethod();
} catch (err) {
  if (err instanceof OmniWorkerError) {
    // Type-safe: err.code, err.cause, err.workerPath all available
  }
}
```

### Exceptions

- The demo must not crash — all expected errors must be caught
- Unexpected errors should be logged and exit with code 1

### Tests

| Test | Assertion |
|------|-----------|
| Normal op succeeds | First operation returns correct result |
| Destroyed error caught | `WORKER_ALREADY_DESTROYED` error caught and displayed |
| Error type correct | `instanceof OmniWorkerError` is true |
| Error properties | `.code`, `.workerPath` populated on caught error |
| Demo doesn't crash | Exit code 0 despite triggering errors |
