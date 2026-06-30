/**
 * Custom hook: `useOmniWorkerPool<T>`
 *
 * Manages the lifecycle of an omniWorkerPool instance.
 * Creates the pool on mount and destroys it on unmount.
 *
 * @typeParam T — Interface describing the worker's API shape
 * @param createPool — Factory function that creates the pool
 * @returns Object with pool instance, worker count, readiness, and destroy
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { IOmniWorkerPool } from '@anonaddy/omni-worker';

export interface UseOmniWorkerPoolResult<T> {
  pool: IOmniWorkerPool<T> | null;
  workerCount: number;
  isReady: boolean;
  isDestroyed: boolean;
  destroy: () => Promise<void>;
}

/**
 * Hook that creates an omniWorkerPool on mount and destroys it on unmount.
 *
 * @typeParam T — Interface describing the worker's API shape
 * @param createPool — Factory that creates the pool instance
 * @returns Pool instance and lifecycle state
 */
export function useOmniWorkerPool<T>(
  createPool: () => IOmniWorkerPool<T>,
): UseOmniWorkerPoolResult<T> {
  const [pool, setPool] = useState<IOmniWorkerPool<T> | null>(null);
  const [workerCount, setWorkerCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);

  // Store createPool in a ref so the effect doesn't depend on it (avoids infinite re-renders)
  const createRef = useRef(createPool);
  createRef.current = createPool;

  // Create pool on mount, destroy on unmount
  useEffect(() => {
    const factory = createRef.current;
    const p = factory();
    console.log('[useOmniWorkerPool] Pool created');
    setPool(p);
    setWorkerCount(p.getNumOfWorkers());
    setIsReady(true);
    setIsDestroyed(false);

    return () => {
      console.log('[useOmniWorkerPool] Destroying pool');
      p.destroy().then(() => {
        console.log('[useOmniWorkerPool] Pool destroyed');
        setIsDestroyed(true);
        setIsReady(false);
        setPool(null);
      });
    };
  }, []);

  const destroy = useCallback(async (): Promise<void> => {
    if (pool && !pool.isDestroyed()) {
      await pool.destroy();
      setIsDestroyed(true);
      setIsReady(false);
    }
  }, [pool]);

  return { pool, workerCount, isReady, isDestroyed, destroy };
}
