/**
 * Vite type declarations for Omni Worker `.worker.ts` files.
 *
 * The `omniWorkerVite()` Vite plugin transforms `.worker.ts` imports into
 * modules that export:
 *   - `default`: a data URL string (for browser Worker)
 *   - `url`: same data URL string (named export)
 *   - `code`: raw bundled JS string (for Node.js eval mode)
 *
 * These declarations let TypeScript understand the transformed imports.
 */

declare module '*.worker.ts' {
  /** Data URL of the bundled worker code (default export). */
  const workerUrl: string;
  /** Data URL of the bundled worker code (named export). */
  export const url: string;
  /** Raw bundled JavaScript code for Node.js eval mode. */
  export const code: string;
  /** Default export is the data URL. */
  export default workerUrl;
}
