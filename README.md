# omni-worker-demos

Demonstrations of every feature in the **[omni-worker](https://github.com/avluent/omni-worker)** library — a unified worker abstraction that runs your code inside workers (Node.js `worker_threads` or browser Web Workers) with a single function call.

---

## Quick Start

```bash
# 1. Install dependencies (omni-worker is pulled from git+)
npm install

# 2. Run any Node.js demo
npx tsx node-demos/demos/01_single_worker.ts

# 3. Start any web demo
npm run dev --workspace=web-vanilla    # → http://localhost:5173
npm run dev --workspace=web-react     # → http://localhost:5173
npm run dev --workspace=web-svelte    # → http://localhost:5173
```

---

## Project Structure

```
omni-worker-demos/
├── node-demos/           # 6 Node.js scripts
│   ├── demos/
│   │   ├── 01_single_worker.ts      ← omniWorker<T>()
│   │   ├── 02_worker_with_deps.ts   ← external deps (lodash-es)
│   │   ├── 03_worker_pool.ts        ← omniWorkerPool<T>()
│   │   ├── 04_error_handling.ts     ← OmniWorkerError
│   │   ├── 05_lifecycle.ts          ← destroy() / isDestroyed()
│   │   └── 06_complex_data.ts       ← structured clone
│   └── runner.ts            # runtime bundler for Node.js
├── web-vanilla/           # Vanilla TypeScript SPA
├── web-react/             # React 18 SPA (custom hooks)
├── web-svelte/            # Svelte 4 SPA (reactive lifecycle)
└── shared/workers/        # Shared worker definitions
    ├── math.worker.ts     # MathApi: add, subtract, multiply, factorial
    ├── text.worker.ts     # TextApi: capitalize, reverse, slugify
    └── heavy.worker.ts    # HeavyApi: fibonacci, primeCheck, sleep
```

---

## Node.js Demos

Each script uses the same `createWorker<T>()` / `createPool<T>()` runtime bundler. Run them all in sequence:

```bash
cd node-demos && npm run demo:all
```

### Demo 01 — Single Worker

Creates one worker and calls its methods.

```bash
npx tsx node-demos/demos/01_single_worker.ts
```

**Output:**
```
=== Single Worker Demo ===
add(10, 25) = 35
subtract(100, 37) = 63
multiply(8, 7) = 56
factorial(10) = 3628800
Worker destroyed.
```

**Code pattern:**
```typescript
import { createWorker } from '../runner';
import type { MathApi } from '../../shared/workers/math.worker';

const worker = await createWorker<MathApi>('math.worker.ts');
const result = await worker.use().add(10, 25);   // → 35
await worker.destroy();                           // always clean up
```

---

### Demo 02 — Worker with External Dependencies

Shows how the Vite plugin bundles external npm packages (lodash-es) into the worker.

```bash
npx tsx node-demos/demos/02_worker_with_deps.ts
```

**Output:**
```
=== Worker with External Dependencies ===
capitalize('hello world') = "Hello world"
reverse('omni-worker') = "rekrow-inmo"
slugify('Hello World!') = "hello-world"
(lodash-es was bundled into the worker by esbuild)
Worker destroyed.
```

**Key insight:** The worker file imports `lodash-es`. The esbuild bundler in the Vite plugin inlines this dependency. No separate install in the worker context is needed.

---

### Demo 03 — Worker Pool (Round-Robin)

Creates a pool of 4 workers and dispatches 8 tasks in round-robin fashion.

```bash
npx tsx node-demos/demos/03_worker_pool.ts
```

**Output:**
```
=== Worker Pool Demo (Round-Robin) ===
Pool size: 4 workers
Tasks submitted: 8

fibonacci(30) = 832040
fibonacci(31) = 1346269
... (8 results total)
Tasks distributed across 4 workers (round-robin).
Pool destroyed.
```

**Code pattern:**
```typescript
import { createPool } from '../runner';
import type { HeavyApi } from '../../shared/workers/heavy.worker';

const pool = await createPool<HeavyApi>('heavy.worker.ts', 4);

// Each pool.use() call goes to the next worker (round-robin)
const results = await Promise.all(
  [30, 31, 29, 32, 28, 33, 27, 34].map(n => pool.use().fibonacci(n))
);
await pool.destroy();
```

---

### Demo 04 — Error Handling

Triggers `OmniWorkerError` and catches it with type-safe handling.

```bash
npx tsx node-demos/demos/04_error_handling.ts
```

**Output:**
```
=== Error Handling Demo ===

[1] Normal operation (should succeed):
    add(5, 3) = 8 ✓

[2] Using destroyed worker (should fail):
    Destroying worker...
    Attempting to use destroyed worker...
    ✗ OmniWorkerError caught:
      code: WORKER_ALREADY_DESTROYED
      workerPath: math.worker.ts
```

**Code pattern:**
```typescript
import { OmniWorkerError } from '@anonaddy/omni-worker';

try {
  const result = await worker.use().add(5, 3);
} catch (err) {
  if (err instanceof OmniWorkerError) {
    console.log(err.code);      // 'WORKER_ALREADY_DESTROYED'
    console.log(err.toString()); // formatted message
  }
}
```

---

### Demo 05 — Worker Lifecycle

Shows `isDestroyed()` state transitions and idempotent `destroy()`.

```bash
npx tsx node-demos/demos/05_lifecycle.ts
```

**Output:**
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

---

### Demo 06 — Complex Data Transfer

Passes objects, arrays, and nested structures through the worker boundary.

```bash
npx tsx node-demos/demos/06_complex_data.ts
```

**Output:**
```
=== Complex Data Transfer Demo ===

transformObject({ name: "test", value: 42 }):
  → { name: "TEST", value: 84 }

transformArray([1, 2, 3, 4, 5]):
  → [1, 4, 9, 16, 25]

aggregate({ items: [...] }):
  → { count: 5, sum: 55 }
Complex data transfer demo complete.
```

---

## Web Demos

Each web app runs as a Vite dev server. All three share the same tabs:

| Tab | Feature | Worker |
|-----|---------|--------|
| **Single Worker** | `omniWorker<MathApi>()` | math.worker.ts |
| **Worker Pool** | `omniWorkerPool<HeavyApi>()` | heavy.worker.ts |
| **Error Handling** | `OmniWorkerError` codes | — |
| **Lifecycle** | `destroy()` / `isDestroyed()` | math + pool |

### Vanilla TypeScript (`web-vanilla/`)

No framework — pure DOM manipulation with TypeScript.

```bash
npm run dev --workspace=web-vanilla
# → http://localhost:5173
```

**How it works:** Workers are created per-tab, destroyed on tab switch and `beforeunload`. Results are rendered directly to DOM elements.

### React 18 (`web-react/`)

React SPA with custom hooks for worker lifecycle management.

```bash
npm run dev --workspace=web-react
# → http://localhost:5173
```

**Custom hooks:**
```typescript
// useOmniWorker<T>() — create on mount, destroy on unmount
const { worker, isReady, destroy } = useOmniWorker<MathApi>(() =>
  omniWorker<MathApi>('math', workerUrl)
);

// useOmniWorkerPool<T>() — same pattern for pools
const { pool, workerCount, destroy } = useOmniWorkerPool<HeavyApi>(
  () => omniWorkerPool<HeavyApi>('heavy', poolUrl, { count: 4 }),
);
```

### Svelte 4 (`web-svelte/`)

Svelte SPA with fine-grained reactive state and `onMount`/`onDestroy` lifecycle.

```bash
npm run dev --workspace=web-svelte
# → http://localhost:5173
```

**Svelte pattern:**
```svelte
<script lang="ts">
  onMount(() => {
    worker = omniWorker<MathApi>('math', workerUrl);
  });

  onDestroy(() => {
    worker?.destroy();  // always clean up
  });
</script>
```

---

## Shared Workers

Three worker files live in `shared/workers/` and are shared by all platforms:

### math.worker.ts
```typescript
export const api: MathApi = {
  add(a: number, b: number) { return a + b; },
  subtract(a: number, b: number) { return a - b; },
  multiply(a: number, b: number) { return a * b; },
  factorial(n: number) { /* iterative */ },
  transformObject, transformArray, aggregate, // complex data
};
```

### text.worker.ts
```typescript
import { capitalize } from 'lodash-es';

export const api: TextApi = {
  capitalize,       // via lodash-es (bundled by esbuild)
  reverse(str) { return str.split('').reverse().join(''); },
  slugify(str) { /* URL-friendly slug */ },
};
```

### heavy.worker.ts
```typescript
export const api: HeavyApi = {
  fibonacci(n) { /* iterative */ },
  primeCheck(n) { /* trial division */ },
  sleep(ms) { /* simulated async delay */ },
};
```

---

## Feature Matrix

| Feature | Node.js | Web Vanilla | Web React | Web Svelte |
|---------|:-------:|:-----------:|:---------:|:----------:|
| `omniWorker()` — single worker | ✅ | ✅ | ✅ | ✅ |
| `omniWorkerPool()` — worker pool | ✅ | ✅ | ✅ | ✅ |
| Typed API (`omniWorker<T>`) | ✅ | ✅ | ✅ | ✅ |
| Comlink proxy (`worker.use()`) | ✅ | ✅ | ✅ | ✅ |
| External dependency bundling | ✅ | ✅ | ✅ | ✅ |
| `OmniWorkerError` handling | ✅ | ✅ | ✅ | ✅ |
| `destroy()` / `isDestroyed()` | ✅ | ✅ | ✅ | ✅ |
| Idempotent `destroy()` | ✅ | ✅ | ✅ | ✅ |
| Complex data transfer | ✅ | ✅ | ✅ | ✅ |
| Custom hooks (React) | — | — | ✅ | — |
| Reactive lifecycle (Svelte) | — | — | — | ✅ |
| ARIA tab navigation | — | ✅ | ✅ | ✅ |

---

## How It All Fits Together

```
┌─────────────────────────────────────────┐
│  shared/workers/*.worker.ts             │
│  (export const api = { ... })           │
└──────────────┬──────────────────────────┘
               │
    ┌──────────▼──────────┐
    │  omniWorkerVite()   │  ← Vite plugin bundles with esbuild
    │  plugin             │
    └──┬──────────────┬───┘
       │              │
  ┌────▼───┐    ┌─────▼────────┐
  │ code   │    │ url (data:)  │  ← Vite plugin exports both
  │ (Node) │    │ (Browser)    │
  └───┬────┘    └─────┬────────┘
      │               │
  ┌───▼───┐      ┌────▼──────────┐
  │ eval: │      │ new Worker(   │
  │ true  │      │ url, {type})  │
  └───┬───┘      └────┬──────────┘
      │               │
  ┌───▼───┐      ┌────▼──────┐
  │ Node  │      │ Browser   │
  │Thread │      │ Web Worker│
  └───────┘      └───────────┘
```

---

## Links

- **omni-worker library**: <https://github.com/avluent/omni-worker>
- **Comlink** (underlying IPC): <https://github.com/nicholasgasior/comlink>
- **WCAG 2.1 AA**: <https://www.w3.org/WAI/WCAG21/quickref/>

---

## License

See [LICENSE](./LICENSE).
