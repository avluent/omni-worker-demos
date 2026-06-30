# Architectural Design — Omni Worker Demos

## 1. Overview

This project showcases all features of the `@anonaddy/omni-worker` library through a suite of runnable demos for both **Node.js** and **Web** environments. The architecture follows a monorepo workspace pattern with shared worker definitions consumed by multiple demo applications.

## 2. Project Structure

```
omni-worker-demos/
├── project_management/         # Planning artifacts (this folder)
├── shared/                     # Shared worker definitions
│   └── workers/                # .worker.ts files used by all demos
│       ├── math.worker.ts      # Basic arithmetic operations
│       ├── text.worker.ts      # String processing with external deps
│       └── heavy.worker.ts     # CPU-intensive computation
├── node-demos/                 # Node.js executable scripts
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── demos/
│       ├── 01_single_worker.ts
│       ├── 02_worker_with_deps.ts
│       ├── 03_worker_pool.ts
│       ├── 04_error_handling.ts
│       ├── 05_lifecycle.ts
│       └── 06_complex_data.ts
├── web-vanilla/                # Vanilla HTML/JS web demo
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.ts
│       ├── app.ts              # Tab-based UI controller
│       └── demos/              # One module per tab/demo
├── web-react/                  # React web demo
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       └── components/         # React components per demo
├── web-svelte/                 # Svelte web demo
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── App.svelte
│       ├── main.ts
│       └── components/         # Svelte components per demo
├── package.json                # Root workspace config
└── README.md                   # Project documentation
```

## 3. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    omni-worker-demos                         │
│                     (npm workspaces)                         │
│                                                              │
│  ┌──────────────┐                                           │
│  │   shared/    │  .worker.ts files (shared across all)     │
│  │   workers/   │  ───────────────────────────────────────   │
│  │              │  math.worker.ts                            │
│  │              │  text.worker.ts                            │
│  │              │  heavy.worker.ts                           │
│  └──────┬───────┘                                           │
│         │                                                    │
│  ┌──────┴──────────────────────────────────────────┐         │
│  │              omniWorkerVite() plugin             │         │
│  │  Bundles .worker.ts → exports { code, url }     │         │
│  └──────┬──────────────────────────────────────────┘         │
│         │                                                    │
│    ┌────┴────┬──────────────┬───────────────┐               │
│    ▼         ▼              ▼               ▼               │
│  ┌──────┐ ┌────────┐ ┌──────────┐  ┌──────────┐            │
│  │ node │ │ vanilla│ │  react   │  │  svelte  │            │
│  │demos │ │  web   │ │   web    │  │   web    │            │
│  └──────┘ └────────┘ └──────────┘  └──────────┘            │
│    │         │              │               │               │
│    ▼         ▼              ▼               ▼               │
│  ┌──────────────────────────────────────────────────┐       │
│  │       @anonaddy/omni-worker (git+)               │       │
│  │  ┌──────────────────────────────────────────┐    │       │
│  │  │ omniWorker<T>()   omniWorkerPool<T>()    │    │       │
│  │  │ Auto-detects: Node worker_threads        │    │       │
│  │  │              Browser Web Workers          │    │       │
│  │  │ Comlink-based message passing            │    │       │
│  │  │ OmniWorkerError / ErrorCodes             │    │       │
│  │  └──────────────────────────────────────────┘    │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## 4. Shared Worker Definitions

All worker files follow the omni-worker convention:

| File | Purpose | API Methods |
|------|---------|-------------|
| `math.worker.ts` | Basic arithmetic | `add()`, `subtract()`, `multiply()`, `factorial()` |
| `text.worker.ts` | String operations with lodash-es | `capitalize()`, `reverse()`, `slugify()` |
| `heavy.worker.ts` | CPU-intensive work | `fibonacci()`, `primeCheck()`, `sleep()` |

Each worker exports `api` object containing typed functions. Dependencies (e.g., lodash-es) are bundled by the Vite plugin's esbuild integration.

## 5. Demo Applications

### 5.1 Node.js Demos (`node-demos/`)

Executable TypeScript scripts demonstrating each feature. Each script:
- Imports a shared worker
- Performs operations
- Logs results to stdout
- Cleans up with `worker.destroy()`

| Script | Feature Demonstrated |
|--------|---------------------|
| `01_single_worker.ts` | `omniWorker<T>()` — basic usage |
| `02_worker_with_deps.ts` | Worker with external dependencies |
| `03_worker_pool.ts` | `omniWorkerPool<T>()` — round-robin |
| `04_error_handling.ts` | `OmniWorkerError` — error codes & handling |
| `05_lifecycle.ts` | `destroy()`, `isDestroyed()` — lifecycle |
| `06_complex_data.ts` | Complex data transfer across workers |

### 5.2 Web — Vanilla (`web-vanilla/`)

Single-page application with tabbed interface. Pure TypeScript/HTML. Each tab renders results into DOM elements. Shows visual feedback (loading states, results, error messages).

### 5.3 Web — React (`web-react/`)

React-based SPA with tabbed interface. Uses React state to manage worker lifecycle and results. Demonstrates integration with React's rendering model.

### 5.4 Web — Svelte (`web-svelte/`)

Svelte-based SPA with tabbed interface. Uses Svelte's reactive stores for worker state. Demonstrates integration with Svelte's fine-grained reactivity.

## 6. Dependency Management

```json
{
  "workspaces": ["node-demos", "web-vanilla", "web-react", "web-svelte"],
  "dependencies": {
    "@anonaddy/omni-worker": "git+https://github.com/avluent/omni-worker.git"
  }
}
```

The omni-worker package is consumed via `git+` protocol, always pulling the latest from the main branch.

## 7. Build Tooling

All apps use **Vite** with the `omniWorkerVite()` plugin. This ensures:
- `.worker.ts` files are bundled by esbuild
- The Vite plugin injects `Comlink.expose(api)` automatically
- Both `code` (Node eval) and `url` (browser Worker) exports are generated
- HMR support for development

## 8. Feature Coverage Matrix

| Feature | Node.js | Web Vanilla | Web React | Web Svelte |
|---------|---------|-------------|-----------|------------|
| omniWorker (single) | ✅ | ✅ | ✅ | ✅ |
| omniWorkerPool | ✅ | ✅ | ✅ | ✅ |
| Worker with deps | ✅ | ✅ | ✅ | ✅ |
| Error handling | ✅ | ✅ | ✅ | ✅ |
| Lifecycle (destroy) | ✅ | ✅ | ✅ | ✅ |
| Auto-detection | ✅ | ✅ | ✅ | ✅ |
| Vite plugin | ✅ | ✅ | ✅ | ✅ |
| Complex data | ✅ | ✅ | ✅ | ✅ |

## 9. Design Decisions

### 9.1 Monorepo with Workspaces
- **Rationale**: Shared worker definitions and dependency management. ISO/IEC 25010 — Modularity.
- **Alternative considered**: Separate repos with npm publish, but git+ makes monorepo simpler.

### 9.2 Vite for All Apps
- **Rationale**: The `omniWorkerVite()` plugin is Vite-specific. Using Vite consistently avoids toolchain fragmentation.
- **Compliance**: Follows library's documented usage pattern.

### 9.3 Tabbed UI for Web Demos
- **Rationale**: Allows comparison between features without page reloads. Improves UX over separate pages.
- **Accessibility**: Tabs follow WAI-ARIA Authoring Practices.

### 9.4 Numbered Node.js Scripts
- **Rationale**: Execution order communicates progression from basic to advanced. `tsx` can run them sequentially.

### 9.5 git+ for omni-worker Dependency
- **Rationale**: As requested by the user. Demonstrates the module from its source of truth without needing an npm release.

## 10. Non-Functional Considerations

- **Accessibility**: Web demos use semantic HTML, ARIA roles for tabs, keyboard navigation
- **Type Safety**: Full TypeScript coverage in all demos
- **Cleanup**: All demos call `destroy()` in finally blocks or cleanup hooks
- **Error Visibility**: Errors displayed prominently in web demos, thrown with stack traces in Node demos
