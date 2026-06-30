# NFR-005: Cross-Environment Consistency

| Field | Value |
|-------|-------|
| **ID** | NFR-005 |
| **Title** | Cross-Environment Consistency |
| **Category** | Quality — Portability |
| **Created** | 2026-06-30T00:00:00.000Z |
| **Last Updated** | 2026-06-30T00:00:00.000Z |
| **Priority** | High |

## Description

As a developer evaluating omni-worker, I want the same worker definitions to work identically across Node.js and browser environments, so that I can trust the library's cross-platform promise.

## Definition of Done

- [ ] Same `shared/workers/` files used by all demo applications
- [ ] Same worker API types imported across all platforms
- [ ] Environment auto-detection pattern used consistently
- [ ] Results are identical regardless of runtime (Node vs Browser)
- [ ] No platform-specific workarounds in worker code

## Specification

### Shared Worker Pattern

```
┌─────────────────────────────┐
│  shared/workers/            │
│  ├── math.worker.ts         │
│  ├── text.worker.ts         │
│  └── heavy.worker.ts        │
└──────────┬──────────────────┘
           │ (same files)
     ┌─────┴──────┬──────────┬──────────┐
     ▼            ▼          ▼          ▼
  Node.js    Vanilla     React      Svelte
  demos      web         web        web
```

### Environment Detection

Every demo uses the same pattern:

| Variable | Logic | Result in Node | Result in Browser |
|----------|-------|---------------|-------------------|
| `isNode` | `typeof process !== 'undefined' && process.versions?.node` | `true` | `false` |
| `source` | `isNode ? code : workerUrl` | bundled code string | data URL |

### Vite Plugin Output

The `omniWorkerVite()` plugin transforms `.worker.ts` imports to:

| Export | Type | Used By |
|--------|------|---------|
| `code` | `string` (bundled JS) | Node.js (`eval: true`) |
| `url` | `string` (data URL) | Browser (`new Worker()`) |
| `default` | `string` (data URL) | Browser (convenience) |

### Consistency Verification

| Aspect | Node.js | Browser | Match? |
|--------|---------|---------|--------|
| Worker API | `export const api` | `export const api` | Yes |
| Return types | `Promise<T>` | `Promise<T>` | Yes |
| Error codes | `OmniWorkerErrorCodes` | `OmniWorkerErrorCodes` | Yes |
| Data transfer | Structured clone | Structured clone | Yes |

### Compliance

ISO/IEC 25010 — Portability: "Ease with which a system can be transferred from one environment to another"

### Exceptions

- `stdout/stderr` behavior differs (Node inherits stderr, browser has no equivalent)
- Worker termination is synchronous in browser, async in Node — both handled by `await destroy()`

### Tests

| Test | Assertion |
|------|-----------|
| Same workers | `shared/workers/` imported by all demos |
| Same results | `add(1, 2)` returns `3` in both environments |
| Error codes | Same `OmniWorkerErrorCode` values in both environments |
| Auto-detection | `isNode` pattern consistent across all demos |
