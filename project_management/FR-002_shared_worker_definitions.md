# FR-002: Shared Worker Definitions

| Field | Value |
|-------|-------|
| **ID** | FR-002 |
| **Title** | Shared Worker Definitions |
| **Category** | Infrastructure |
| **Created** | 2026-06-30T00:00:00.000Z |
| **Last Updated** | 2026-06-30T00:00:00.000Z |
| **Priority** | High |

## Description

As a demo developer, I want reusable `.worker.ts` files shared across all demo applications, so that each demo can focus on its specific feature without duplicating worker code.

## Definition of Done

- [ ] `shared/workers/math.worker.ts` — basic arithmetic API
- [ ] `shared/workers/text.worker.ts` — string operations with external dependency (lodash-es)
- [ ] `shared/workers/heavy.worker.ts` — CPU-intensive computation API
- [ ] Each worker exports `api` object per omni-worker convention
- [ ] Workers importable from any workspace via relative paths
- [ ] TypeScript types defined and exported for each worker's API

## Specification

### Worker File Convention

Each worker file follows the omni-worker convention:

```
┌─────────────────────────────────────────┐
│  shared/workers/<name>.worker.ts        │
│                                         │
│  // 1. Imports (any dependencies)       │
│  import { capitalize } from 'lodash-es' │
│                                         │
│  // 2. API interface (for types)        │
│  export interface <Name>Api { ... }     │
│                                         │
│  // 3. api export (required)            │
│  export const api = { ... }             │
└─────────────────────────────────────────┘
```

### Worker API Definitions

#### math.worker.ts

| Method | Signature | Description |
|--------|-----------|-------------|
| `add` | `(a: number, b: number) => number` | Addition |
| `subtract` | `(a: number, b: number) => number` | Subtraction |
| `multiply` | `(a: number, b: number) => number` | Multiplication |
| `factorial` | `(n: number) => number` | Iterative factorial (CPU work) |

#### text.worker.ts

| Method | Signature | Description |
|--------|-----------|-------------|
| `capitalize` | `(str: string) => string` | Via lodash-es capitalize |
| `reverse` | `(str: string) => string` | String reversal |
| `slugify` | `(str: string) => string` | URL slug creation |

#### heavy.worker.ts

| Method | Signature | Description |
|--------|-----------|-------------|
| `fibonacci` | `(n: number) => number` | Iterative fibonacci |
| `primeCheck` | `(n: number) => boolean` | Primality test |
| `sleep` | `(ms: number) => string` | Simulated async delay |

### Type Exports

Each worker file exports an interface matching its `api` object. This interface is used as the generic type parameter in `omniWorker<T>()` and `omniWorkerPool<T>()` calls.

### Exceptions

- Worker files must use `.worker.ts` extension (enforced by omniWorkerVite plugin)
- Worker files must export `api` (validated by omniWorkerVite plugin at build time)
- If a worker file has syntax errors, the Vite build fails with `BUILD_ERROR`

### Tests

| Test | Assertion |
|------|-----------|
| Worker files exist | All three `.worker.ts` files present in `shared/workers/` |
| API export present | Each file contains `export const api` |
| TypeScript compilation | `tsc --noEmit` passes for each worker |
| Vite plugin resolution | `omniWorkerVite()` resolves each worker during build |
