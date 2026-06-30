# omni-worker-demos

A collection of demos showcasing the **[omni-worker](https://github.com/avluent/omni-worker)** library — a unified worker abstraction that works identically in browser (Web Worker) and Node.js (worker_threads) environments.

## Project Overview

This monorepo demonstrates every major feature of omni-worker across four platforms:

| Workspace | Framework | Description |
|-----------|-----------|-------------|
| `node-demos/` | Node.js + TypeScript | 6 executable scripts covering all API surface |
| `web-vanilla/` | Vanilla TypeScript SPA | Zero-dependency web demo with tabbed UI |
| `web-react/` | React 18 SPA | React demo with custom hooks for worker lifecycle |
| `web-svelte/` | Svelte 4 SPA | Svelte demo with reactive worker management |

Shared worker definitions live in `shared/workers/` and are consumed by all platforms.

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | ≥ 18.0.0 |
| npm | ≥ 9.0.0 |

## Setup

```bash
# Clone the repository
git clone https://github.com/avluent/omni-worker-demos.git
cd omni-worker-demos

# Install all workspace dependencies
npm install
```

## Running Demos

### Node.js Demos

Each script can be run individually with `tsx`:

```bash
# Single worker — basic arithmetic operations
npx tsx node-demos/demos/01_single_worker.ts

# Worker with external dependencies (lodash-es)
npx tsx node-demos/demos/02_worker_with_deps.ts

# Worker pool — round-robin task distribution
npx tsx node-demos/demos/03_worker_pool.ts

# Error handling — OmniWorkerError codes and patterns
npx tsx node-demos/demos/04_error_handling.ts

# Worker lifecycle — destroy, isDestroyed, idempotency
npx tsx node-demos/demos/05_lifecycle.ts

# Complex data transfer — structured clone serialization
npx tsx node-demos/demos/06_complex_data.ts

# Run all demos sequentially
cd node-demos && npm run demo:all
```

### Web Demos

Each web demo runs as a Vite development server:

```bash
# Vanilla TypeScript SPA
npm run dev --workspace=web-vanilla

# React 18 SPA
npm run dev --workspace=web-react

# Svelte 4 SPA
npm run dev --workspace=web-svelte
```

Each demo opens at `http://localhost:5173` by default with hot module replacement.

## Feature Matrix

| Feature | Node.js | Web Vanilla | Web React | Web Svelte |
|---------|:-------:|:-----------:|:---------:|:----------:|
| `omniWorker()` — single worker | ✅ | ✅ | ✅ | ✅ |
| `omniWorkerPool()` — worker pool | ✅ | ✅ | ✅ | ✅ |
| Typed worker API (`omniWorker<T>`) | ✅ | ✅ | ✅ | ✅ |
| Comlink proxy via `worker.use()` | ✅ | ✅ | ✅ | ✅ |
| External dependency bundling | ✅ | ✅ | ✅ | ✅ |
| Structured error handling | ✅ | ✅ | ✅ | ✅ |
| `OmniWorkerError` inspection | ✅ | ✅ | ✅ | ✅ |
| `destroy()` / `isDestroyed()` lifecycle | ✅ | ✅ | ✅ | ✅ |
| Idempotent `destroy()` calls | ✅ | ✅ | ✅ | ✅ |
| Complex data transfer | ✅ | ✅ | ✅ | ✅ |
| WAI-ARIA tab pattern | — | ✅ | ✅ | ✅ |
| Keyboard navigation (arrows, Home/End) | — | ✅ | ✅ | ✅ |
| `aria-live` status announcements | — | ✅ | ✅ | ✅ |
| WCAG 2.1 AA color contrast | — | ✅ | ✅ | ✅ |
| Resource cleanup on tab switch | — | ✅ | ✅ | ✅ |
| Resource cleanup on page unload | — | ✅ | ✅ | ✅ |

## Architecture

```
omni-worker-demos/
├── node-demos/              # Node.js demo scripts
│   ├── demos/               # 6 executable demo scripts
│   ├── runner.ts            # Runtime worker bundler (esbuild)
│   ├── vite.config.ts       # Vite plugin configuration
│   └── tsconfig.json
├── web-vanilla/             # Vanilla TypeScript SPA
│   ├── src/
│   │   ├── app.ts           # Tab controller with ARIA pattern
│   │   ├── tabs/            # Per-tab worker modules
│   │   └── main.ts          # Entry point
│   └── vite.config.ts
├── web-react/               # React 18 SPA
│   ├── src/
│   │   ├── App.tsx          # Root with Error Boundary
│   │   ├── hooks/           # useOmniWorker, useOmniWorkerPool
│   │   └── tabs/            # Per-tab React components
│   └── vite.config.ts
├── web-svelte/              # Svelte 4 SPA
│   ├── src/
│   │   ├── App.svelte       # Root with keyboard navigation
│   │   ├── SingleWorkerTab.svelte
│   │   ├── WorkerPoolTab.svelte
│   │   ├── ErrorHandlingTab.svelte
│   │   └── LifecycleTab.svelte
│   └── vite.config.ts
└── shared/
    └── workers/             # Shared worker definitions
        ├── math.worker.ts   # Arithmetic operations
        ├── text.worker.ts   # String processing (lodash-es)
        └── heavy.worker.ts  # CPU-intensive computations
```

## Shared Workers

Three worker definitions are shared across all platforms:

| Worker | API | Purpose |
|--------|-----|---------|
| `math.worker.ts` | `MathApi` — add, subtract, multiply, factorial, transformObject, transformArray, aggregate | Basic arithmetic and data transformation |
| `text.worker.ts` | `TextApi` — capitalize, reverse, slugify | String processing with external dependency (lodash-es) |
| `heavy.worker.ts` | `HeavyApi` — fibonacci, primeCheck, sleep | CPU-bound and async operations for pool demos |

## Quality Standards

| Standard | Compliance |
|----------|-----------|
| WCAG 2.1 AA (web demos) | ✅ |
| TypeScript strict mode | ✅ |
| Resource cleanup discipline | ✅ |
| Cross-environment consistency | ✅ |

## Links

- **omni-worker library**: <https://github.com/avluent/omni-worker>
- **Comlink**: <https://github.com/GoogleChromeLabs/comlink>
- **WCAG 2.1 AA**: <https://www.w3.org/WAI/WCAG21/quickref/>

## License

See [LICENSE](./LICENSE) file.
