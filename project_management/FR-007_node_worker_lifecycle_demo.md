# FR-007: Node.js — Worker Lifecycle Demo

| Field | Value |
|-------|-------|
| **ID** | FR-007 |
| **Title** | Node.js — Worker Lifecycle Demo |
| **Category** | Node.js Demo |
| **Created** | 2026-06-30T00:00:00.000Z |
| **Last Updated** | 2026-06-30T00:00:00.000Z |
| **Priority** | Medium |

## Description

As a developer, I want to see a demo of worker lifecycle management, so that I understand `isDestroyed()` and idempotent `destroy()` behavior.

## Definition of Done

- [ ] Script file: `node-demos/demos/05_lifecycle.ts`
- [ ] Creates worker and checks `isDestroyed()` before use
- [ ] Uses worker, then destroys it
- [ ] Checks `isDestroyed()` after destroy (should be `true`)
- [ ] Calls `destroy()` again to show idempotency (no error)
- [ ] Verifies pool lifecycle (`pool.isDestroyed()`, `pool.destroy()`)

## Specification

### Lifecycle States

```
┌───────────┐    use()     ┌───────────────┐    destroy()    ┌───────────┐
│  CREATED  │ ────────────▶ │   ACTIVE      │ ──────────────▶ │  DEAD     │
│ !destroyed│               │  !destroyed   │                 │ destroyed │
└───────────┘               └───────────────┘                 └───────────┘
     │                          │                                │
     │                          │                                │
     │                          │                     destroy() again
     │                          │                         (no-op)
     ▼                          ▼                                ▼
  false                      false                            false
```

### Script Flow

| Step | Action | Expected `isDestroyed()` |
|------|--------|--------------------------|
| 1 | Create worker | `false` |
| 2 | Use worker (add) | `false` |
| 3 | `worker.destroy()` | transitions to `true` |
| 4 | Check `isDestroyed()` | `true` |
| 5 | `worker.destroy()` again | `true` (idempotent, no error) |
| 6 | Create pool, destroy, check | Same pattern |

### Output Format

```
=== Worker Lifecycle Demo ===

[Worker]
  isDestroyed(): false
  add(10, 20) = 30
  destroy() called...
  isDestroyed(): true
  destroy() called again (idempotent)...
  isDestroyed(): true

[Pool]
  getNumOfWorkers(): 3
  isDestroyed(): false
  destroy() called...
  isDestroyed(): true

Lifecycle demo complete.
```

### Idempotency

Both `worker.destroy()` and `pool.destroy()` are idempotent. Calling them multiple times is safe and returns immediately without side effects after the first call.

### Exceptions

- `WORKER_ALREADY_DESTROYED` — if `use()` called after `destroy()`, properly thrown
- No exceptions from repeated `destroy()` calls

### Tests

| Test | Assertion |
|------|-----------|
| isDestroyed false initially | Returns `false` before destroy |
| isDestroyed true after destroy | Returns `true` after first destroy |
| destroy idempotent | Second `destroy()` doesn't throw |
| Pool lifecycle | Same assertions for pool |
