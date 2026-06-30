# FR-008: Node.js — Complex Data Transfer Demo

| Field | Value |
|-------|-------|
| **ID** | FR-008 |
| **Title** | Node.js — Complex Data Transfer Demo |
| **Category** | Node.js Demo |
| **Created** | 2026-06-30T00:00:00.000Z |
| **Last Updated** | 2026-06-30T00:00:00.000Z |
| **Priority** | Low |

## Description

As a developer, I want to see a demo of passing complex data structures to and from workers, so that I understand what Comlink can serialize across the worker boundary.

## Definition of Done

- [ ] Script file: `node-demos/demos/06_complex_data.ts`
- [ ] Passes objects, arrays, and nested structures to worker
- [ ] Worker transforms and returns complex results
- [ ] Demonstrates structured clone limitations
| **Priority** | Low |

## Specification

### Data Types to Demonstrate

| Type | Example | Serialized |
|------|---------|------------|
| Plain object | `{ name: 'test', value: 42 }` | Yes |
| Array | `[1, 2, 3]` | Yes |
| Nested object | `{ a: { b: { c: 1 } } }` | Yes |
| TypedArray | `Uint8Array` | Yes (transferred) |
| Map/Set | `new Map()` | Via structured clone |
| Date | `new Date()` | Yes |

### Script Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Create complex  │────▶│  Pass to worker  │────▶│  Worker processes│
│  data structures │     │  via worker.use()│     │  and transforms  │
└──────────────────┘     └──────────────────┘     └────────┬─────────┘
                                                           │
                                                  ┌────────▼────────┐
                                                  │  Worker returns  │
                                                  │  transformed     │
                                                  │  complex data    │
                                                  └────────┬─────────┘
                                                           │
                                                  ┌────────▼────────┐
                                                  │  Log results    │
                                                  │  + types        │
                                                  └─────────────────┘
```

### Output Format

```
=== Complex Data Transfer Demo ===

Input: { name: "test", value: 42 }
Output: { name: "TEST", value: 84 }

Input: [1, 2, 3, 4, 5]
Output: [1, 4, 9, 16, 25]

Input: { matrix: [[1,2],[3,4]] }
Output: { sum: 10, flattened: [1,2,3,4] }

Complex data transfer demo complete.
```

### Worker API Extension

The math.worker.ts (or a dedicated data worker) needs methods that accept and return complex structures:

| Method | Input | Output |
|--------|-------|--------|
| `transformObject` | `Record<string, any>` | `Record<string, any>` |
| `transformArray` | `number[]` | `number[]` |
| `aggregate` | `{ items: any[] }` | `{ count: number, sum: number }` |

### Exceptions

- `DataCloneError` — if non-serializable data is passed (e.g., functions, DOM nodes)
- Serialization errors caught and displayed

### Tests

| Test | Assertion |
|------|-----------|
| Object transfer | Object received and transformed correctly |
| Array transfer | Array elements processed correctly |
| Nested data | Deep structures preserved through round-trip |
| TypedArray | Binary data transferred correctly |
