# FR-005: Node.js — Worker Pool Demo

| Field | Value |
|-------|-------|
| **ID** | FR-005 |
| **Title** | Node.js — Worker Pool Demo |
| **Category** | Node.js Demo |
| **Created** | 2026-06-30T00:00:00.000Z |
| **Last Updated** | 2026-06-30T00:00:00.000Z |
| **Priority** | High |

## Description

As a developer, I want to see a demo of the worker pool with round-robin dispatch, so that I understand how tasks are distributed across multiple workers.

## Definition of Done

- [ ] Script file: `node-demos/demos/03_worker_pool.ts`
- [ ] Uses `omniWorkerPool<HeavyApi>()` with pool count of 4
- [ ] Submits 8+ tasks via `Promise.all()` to show parallelism
- [ ] Logs `pool.getNumOfWorkers()` to verify pool size
- [ ] Demonstrates round-robin distribution visually
- [ ] Calls `pool.destroy()` in a `finally` block

## Specification

### Pool Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| `count` | 4 | Enough to show distribution, small enough to be fast |
| Worker type | `heavy.worker.ts` | CPU work shows parallelism benefit |
| Tasks | 8 fibonacci calls | 2 tasks per worker in round-robin |

### Script Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  import worker  │────▶│  omniWorkerPool< │────▶│  Promise.all(    │
│  + pool         │     │  HeavyApi>()     │     │    tasks.map(    │
│                 │     │  count: 4        │     │      t => pool   │
│                 │     │                  │     │       .use()     │
│                 │     │                  │     │       .fibonacci)│
│                 │     │                  │     │  )               │
└─────────────────┘     └──────────────────┘     └────────┬─────────┘
                                                           │
                                                  ┌────────▼────────┐
                                                  │  Log results    │
                                                  │  + pool size    │
                                                  └────────┬────────┘
                                                           │
                                                  ┌────────▼────────┐
                                                  │  pool.destroy() │
                                                  └─────────────────┘
```

### Output Format

```
=== Worker Pool Demo (Round-Robin) ===
Pool size: 4 workers
Tasks submitted: 8

fibonacci(30) = 832040
fibonacci(31) = 1346269
fibonacci(29) = 514229
fibonacci(32) = 2178309
fibonacci(28) = 317811
fibonacci(33) = 3524578
fibonacci(27) = 196418
fibonacci(34) = 5702887

Tasks distributed across 4 workers (round-robin).
Pool destroyed.
```

### Round-Robin Verification

The demo should note that 8 tasks are dispatched to 4 workers in sequence: 0→1→2→3→0→1→2→3.

### Exceptions

- `INVALID_POOL_COUNT` — if count < 1 or > 128
- `WORKER_ALREADY_DESTROYED` — if pool.use() called after destroy
- `WORKER_CREATE_FAILED` — if any worker in pool fails to start

### Tests

| Test | Assertion |
|------|-----------|
| Pool created | `pool.getNumOfWorkers()` returns 4 |
| All tasks complete | `Promise.all` resolves with 8 results |
| Results correct | Each fibonacci value is mathematically correct |
| Pool destroyed | "Pool destroyed" message present |
| Invalid count | Throws `OmniWorkerError` with `INVALID_POOL_COUNT` |
