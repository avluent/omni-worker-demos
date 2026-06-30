# NFR-002: Type Safety

| Field | Value |
|-------|-------|
| **ID** | NFR-002 |
| **Title** | Full TypeScript Type Safety |
| **Category** | Quality — Maintainability |
| **Created** | 2026-06-30T00:00:00.000Z |
| **Last Updated** | 2026-06-30T00:00:00.000Z |
| **Priority** | High |

## Description

As a developer, I want all demo code to be fully typed with TypeScript, so that the demos serve as correct usage examples and benefit from compile-time checking.

## Definition of Done

- [ ] All `.ts` and `.tsx` files compile with `tsc --noEmit`
- [ ] No `any` types used (except where explicitly documented)
- [ ] Worker API types imported from shared worker definitions
- [ ] Generic type parameters used correctly: `omniWorker<T>()`, `omniWorkerPool<T>()`
- [ ] `Promisify<T>` return types correctly awaited
- [ ] Strict mode enabled in all tsconfig.json files

## Specification

### TypeScript Configuration

All workspace apps use strict mode:

| Setting | Value |
|---------|-------|
| `strict` | `true` |
| `noUnusedLocals` | `true` |
| `noUnusedParameters` | `true` |
| `noImplicitAny` | `true` |
| `strictNullChecks` | `true` |
| `moduleResolution` | `bundler` (Vite) |

### Type Usage Pattern

```typescript
// Import shared types
import type { MathApi } from '../../shared/workers/math.worker';

// Create typed worker
const worker = omniWorker<MathApi>('math', workerSource);

// Type-safe calls (return type is Promise<number>)
const result: number = await worker.use().add(1, 2);
```

### Generic Type Parameters

| Function | Type Param | Description |
|----------|-----------|-------------|
| `omniWorker<T>()` | `T` = Worker API interface | Shapes the `use()` proxy |
| `omniWorkerPool<T>()` | `T` = Worker API interface | Shapes pool's `use()` proxy |

### Type Safety Enforcement

- `noImplicitAny`: No implicit `any` types
- `strictNullChecks`: Null/undefined checked explicitly
- `noUnusedLocals`: Dead code detected

### Exceptions

- `unknown` may be used for catch block error variables before type narrowing
- `as` casts only used where Comlink proxy types need bridging

### Tests

| Test | Command | Assertion |
|------|---------|-----------|
| Type check | `tsc --noEmit` in each workspace | Exit code 0 |
| No any types | Grep for `: any` | Zero results (or documented exceptions) |
| Strict mode | Check tsconfig.json | `strict: true` in all configs |
