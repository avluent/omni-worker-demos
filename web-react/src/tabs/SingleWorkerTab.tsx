/**
 * Tab: Single Worker
 *
 * Demonstrates `omniWorker<MathApi>()` with input fields, a run button,
 * and a result display area. Shows visual feedback for each operation
 * state (idle → running → success/error).
 */

import { useState, useCallback } from 'react';
import { omniWorker } from '@anonaddy/omni-worker';
// @ts-expect-error Vite omniWorkerVite plugin transforms .worker.ts at build time
import workerUrl from '../../../shared/workers/math.worker.ts';
import type { MathApi } from '../types';
import { useOmniWorker } from '../hooks/useOmniWorker';

/** Allowed operations that take two numeric arguments. */
type BinaryOperation = 'add' | 'subtract' | 'multiply';
/** All supported operations on MathApi. */
type Operation = BinaryOperation | 'factorial';

const OPERATIONS: Record<Operation, string> = {
  add: 'Add',
  subtract: 'Subtract',
  multiply: 'Multiply',
  factorial: 'Factorial',
};

/**
 * Renders the Single Worker tab UI.
 */
export function SingleWorkerTab(): JSX.Element {
  const [valueA, setValueA] = useState<string>('42');
  const [valueB, setValueB] = useState<string>('58');
  const [operation, setOperation] = useState<Operation>('add');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Worker lifecycle managed by hook: created on mount, destroyed on unmount
  const { worker } = useOmniWorker<MathApi>(() =>
    omniWorker<MathApi>('math', workerUrl),
  );

  const handleRun = useCallback(async (): Promise<void> => {
    if (!worker) return;

    setResult(null);
    setError(null);
    setLoading(true);

    const a = parseFloat(valueA);
    const b = parseFloat(valueB);

    try {
      const start = performance.now();
      let value: number;

      if (operation === 'factorial') {
        value = await worker.use().factorial(a);
      } else {
        const binOp = operation as BinaryOperation;
        const api = worker.use();
        value = await api[binOp](a, b);
      }
      const elapsed = (performance.now() - start).toFixed(2);

      setResult(`Result: ${value}\nTime: ${elapsed}ms`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [valueA, valueB, operation, worker]);

  return (
    <div>
      <h2 style={{ marginTop: '0' }}>Single Worker Demo</h2>
      <p style={{ color: '#555', fontSize: '0.9rem' }}>
        Uses omniWorker&lt;MathApi&gt;() — a single Web Worker with Comlink proxy.
        Enter two numbers and pick an operation.
      </p>

      <div className="control-group">
        <div className="input-field">
          <label htmlFor="react-math-a">A</label>
          <input
            type="number"
            id="react-math-a"
            value={valueA}
            onChange={(e) => setValueA(e.target.value)}
            disabled={loading}
            aria-label="First operand"
          />
        </div>
        <div className="input-field">
          <label htmlFor="react-math-b">B</label>
          <input
            type="number"
            id="react-math-b"
            value={valueB}
            onChange={(e) => setValueB(e.target.value)}
            disabled={loading}
            aria-label="Second operand"
          />
        </div>
        <div className="input-field">
          <label htmlFor="react-math-op">Operation</label>
          <select
            id="react-math-op"
            value={operation}
            onChange={(e) => setOperation(e.target.value as Operation)}
            disabled={loading}
            aria-label="Math operation"
          >
            {Object.entries(OPERATIONS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn"
          onClick={handleRun}
          disabled={loading}
          aria-label="Execute math operation"
        >
          {loading ? 'Running…' : 'Run'}
        </button>
      </div>

      {loading && (
        <div aria-live="polite" aria-atomic="true">
          <span className="spinner" aria-hidden="true" />
          <span>Computing…</span>
        </div>
      )}

      {result !== null && (
        <div
          className="result-box"
          aria-live="polite"
          aria-atomic="true"
        >
          {result}
        </div>
      )}

      {error !== null && (
        <div
          className="error-box"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}
    </div>
  );
}
