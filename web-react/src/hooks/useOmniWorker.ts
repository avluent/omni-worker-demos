/**
 * Custom hook: `useOmniWorker<T>`
 *
 * Manages the lifecycle of a single omniWorker instance.
 * Creates the worker on mount and destroys it on unmount.
 *
 * @typeParam T — Interface describing the worker's API shape
 * @param createWorker — Factory function that creates the worker
 * @returns Object with worker instance, readiness state, and destroy function
 */

import { useState, useEffect, useCallback } from 'react';
import type { IOmniWorker } from '@anonaddy/omni-worker';

export interface UseOmniWorkerResult<T> {
  worker: IOmniWorker<T> | null;
  isReady: boolean;
  isDestroyed: boolean;
  destroy: () => Promise<void>;
}

/**
 * Hook that creates an omniWorker on mount and destroys it on unmount.
 *
 * @typeParam T — Interface describing the worker's API shape
 * @param createWorker — Factory that creates the worker instance
 * @returns Worker instance and lifecycle state
 */
export function useOmniWorker<T>(
  createWorker: () => IOmniWorker<T>,
): UseOmniWorkerResult<T> {
  const [worker, setWorker] = useState<IOmniWorker<T> | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);

  // Create worker on mount, destroy on unmount
  useEffect(() => {
    const w = createWorker();
    setWorker(w);
    setIsReady(true);
    setIsDestroyed(false);

    return () => {
      w.destroy().then(() => {
        setIsDestroyed(true);
        setIsReady(false);
        setWorker(null);
      });
    };
  }, [createWorker]);

  const destroy = useCallback(async (): Promise<void> => {
    if (worker && !worker.isDestroyed()) {
      await worker.destroy();
      setIsDestroyed(true);
      setIsReady(false);
    }
  }, [worker]);

  return { worker, isReady, isDestroyed, destroy };
}
