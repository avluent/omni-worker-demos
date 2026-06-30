# NFR-004: Documentation and Code Quality

| Field | Value |
|-------|-------|
| **ID** | NFR-004 |
| **Title** | Documentation and Code Quality |
| **Category** | Quality — Maintainability |
| **Created** | 2026-06-30T00:00:00.000Z |
| **Last Updated** | 2026-06-30T00:00:00.000Z |
| **Priority** | Medium |

## Description

As a developer reading the demos, I want clear documentation and well-structured code, so that I can quickly understand how each omni-worker feature works.

## Definition of Done

- [ ] Root `README.md` explains project structure and how to run each demo
- [ ] Each Node.js script has a JSDoc header explaining the feature
- [ ] Web demos have inline comments explaining omni-worker integration points
- [ ] Consistent code formatting (Prettier or equivalent)
- [ ] Worker files documented with inline comments
- [ ] No `console.log` pollution — structured output in Node.js demos

## Specification

### README Structure

| Section | Content |
|---------|---------|
| Overview | What this project demonstrates |
| Prerequisites | Node.js version, npm version |
| Setup | `npm install` command |
| Node.js Demos | How to run each script |
| Web Demos | How to run each web app (`npm run dev`) |
| Feature Matrix | Table of features × platforms |

### Code Documentation

#### Node.js Scripts

Each script begins with a JSDoc block:

| Field | Content |
|-------|---------|
| `@description` | What the demo shows |
| `@feature` | omni-worker feature demonstrated |
| `@run` | Command to execute the script |

#### Web Components

Key integration points commented:

```typescript
// omniWorker creates a Web Worker (browser) or worker_thread (Node)
const worker = omniWorker<MathApi>('math', workerSource);

// worker.use() returns a Comlink proxy — all calls are async
const result = await worker.use().add(a, b);
```

### Formatting

| Tool | Configuration |
|------|-------------|
| Prettier | Default settings, 2-space indent |
| Import order | Standard lib → external → internal |

### Console Output

| Environment | Rule |
|------------|------|
| Node.js | Structured output with section headers |
| Web | `console.log` only for debugging; UI shows results |

### Compliance

ISO/IEC 25010 — Maintainability: "Ease with which a software product can be modified"

### Exceptions

- `console.warn` allowed for cleanup warnings (per omni-worker's own pattern)
- `console.error` allowed for uncaught error display

### Tests

| Test | Assertion |
|------|-----------|
| README exists | `README.md` present at root |
| Scripts documented | Each script has JSDoc header |
| Format check | `npx prettier --check` passes |
