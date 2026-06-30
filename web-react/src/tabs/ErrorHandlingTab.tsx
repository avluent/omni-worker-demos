/**
 * Tab: Error Handling
 *
 * Demonstrates how OmniWorkerError is thrown and caught. Triggers
 * known error scenarios and displays the error code, message, and
 * optional cause information.
 */

import { useState } from 'react';
import {
  omniWorker,
  OmniWorkerError,
  OmniWorkerErrorCodes,
} from '@anonaddy/omni-worker';
// @ts-expect-error Vite omniWorkerVite plugin transforms .worker.ts at build time
import workerUrl from '../../../shared/workers/math.worker.ts';
import type { MathApi } from '../types';
import { useOmniWorker } from '../hooks/useOmniWorker';

/** Error scenarios that can be triggered for demonstration. */
interface ErrorScenario {
  id: string;
  label: string;
}

const SCENARIOS: ErrorScenario[] = [
  { id: 'destroyed-worker', label: 'Use Destroyed Worker' },
  {
    id: 'worker-from-worker',
    label: 'Create Worker (Worker thread)',
  },
];

/**
 * Renders the Error Handling tab UI.
 */
export function ErrorHandlingTab(): JSX.Element {
  const [scenario, setScenario] = useState<string>('destroyed-worker');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Worker lifecycle managed by hook
  const { worker } = useOmniWorker<MathApi>(() =>
    omniWorker<MathApi>('math-error', workerUrl),
  );

  const handleTrigger = async (): Promise<void> => {
    setError(null);
    setLoading(true);

    try {
      switch (scenario) {
        case 'destroyed-worker': {
          await triggerDestroyedWorkerError(worker);
          break;
        }
        case 'worker-from-worker': {
          triggerWorkerCreationError();
          break;
        }
        default: {
          throw new Error(`Unknown scenario: ${scenario}`);
        }
      }
    } catch (err: unknown) {
      let details: string;

      if (err instanceof OmniWorkerError) {
        details = `[OmniWorkerError] Code: ${err.code}\nMessage: ${err.message}`;
        if (err.cause) {
          details += `\nCause: ${err.cause.message}`;
        }
        if (err.workerPath) {
          details += `\nWorker: ${err.workerPath}`;
        }
      } else if (err instanceof Error) {
        details = `[Error] ${err.message}`;
      } else {
        details = 'An unexpected error occurred';
      }

      setError(details);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: '0' }}>Error Handling Demo</h2>
      <p style={{ color: '#555', fontSize: '0.9rem' }}>
        Demonstrates OmniWorkerError with machine-readable codes. Select a
        scenario to trigger an error.
      </p>

      <div className="control-group">
        <div className="input-field">
          <label htmlFor="react-error-scenario">Scenario</label>
          <select
            id="react-error-scenario"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            disabled={loading}
            aria-label="Error scenario"
          >
            {SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-danger"
          onClick={handleTrigger}
          disabled={loading}
          aria-label="Trigger error scenario"
        >
          {loading ? 'Running…' : 'Trigger Error'}
        </button>
      </div>

      {error !== null && (
        <div
          className="error-box"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Destroys the given worker, then tries to use it — triggers
 * WORKER_ALREADY_DESTROYED.
 */
async function triggerDestroyedWorkerError(
  worker: ReturnType<typeof omniWorker<MathApi>> | null,
): Promise<void> {
  if (!worker) {
    throw new Error('Worker not available');
  }
  await worker.destroy();
  // Now try to use — should throw WORKER_ALREADY_DESTROYED
  try {
    await worker.use().add(1, 2);
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
  }
}

/**
 * Demonstrates a manually constructed OmniWorkerError to show
 * how the error class works.
 */
function triggerWorkerCreationError(): never {
  throw new OmniWorkerError(
    'Simulated worker creation failure for demonstration',
    {
      code: OmniWorkerErrorCodes.WORKER_CREATE_FAILED,
      workerPath: 'simulated.worker.ts',
    },
  );
}
