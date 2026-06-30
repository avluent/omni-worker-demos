/**
 * Omni Worker Web Demo — Shared application types.
 *
 * @module appTypes
 */

/** Visual states for status feedback. */
export type StatusState = 'idle' | 'running' | 'success' | 'error';

/** Callback signature for updating the global status bar. */
export type StatusCallback = (state: StatusState, message: string) => void;
