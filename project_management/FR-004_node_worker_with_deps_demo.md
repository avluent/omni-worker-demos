# FR-004: Node.js — Worker with External Dependencies

| Field | Value |
|-------|-------|
| **ID** | FR-004 |
| **Title** | Node.js — Worker with External Dependencies |
| **Category** | Node.js Demo |
| **Created** | 2026-06-30T00:00:00.000Z |
| **Last Updated** | 2026-06-30T00:00:00.000Z |
| **Priority** | Medium |

## Description

As a developer, I want to see a demo where the worker imports and uses external npm packages, so that I understand the bundling capability of the Vite plugin.

## Definition of Done

- [ ] Script file: `node-demos/demos/02_worker_with_deps.ts`
- [ ] Uses `omniWorker<TextApi>()` with text worker (which imports lodash-es)
- [ ] Calls `capitalize()`, `reverse()`, `slugify()` methods
- [ ] Logs results showing external dependency functions work inside worker
- [ ] Demonstrates that lodash-es was bundled into worker by esbuild
- [ ] Proper cleanup with `worker.destroy()`

## Specification

### Why This Matters

The omniWorkerVite plugin uses esbuild to bundle the worker file **including all its imports**. This demo proves that external dependencies are inlined into the worker bundle and don't need to be available in the worker's runtime context.

### Script Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  import worker,  │────▶│  omniWorker<     │────▶│  worker.use()    │
│  { code, url }   │     │  TextApi>()      │     │  .capitalize()   │
│  from text       │     │                  │     │  .reverse()      │
│  .worker.ts      │     │  (bundled with   │     │  .slugify()      │
│                  │     │   lodash-es)     │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

### Output Format

```
=== Worker with External Dependencies ===
capitalize('hello world') = "Hello world"
reverse('omni-worker') = "rekrow-inmo"
slugify('Hello World!') = "hello-world"
(lodash-es was bundled into the worker by esbuild)
Worker destroyed.
```

### Dependencies

The text.worker.ts file imports from `lodash-es`. The esbuild bundler in the Vite plugin resolves and inlines this import into the worker bundle.

### Exceptions

- `BUILD_ERROR` — if esbuild fails to resolve lodash-es
- `MISSING_API_EXPORT` — if text.worker.ts doesn't export `api`
- Module not found — if lodash-es is not in node_modules

### Tests

| Test | Assertion |
|------|-----------|
| Script runs | Exit code 0 |
| lodash-es bundled | Worker functions that use lodash-es return correct values |
| Output correct | capitalize, reverse, slugify outputs match expectations |
| Worker destroyed | "Worker destroyed" message present |
