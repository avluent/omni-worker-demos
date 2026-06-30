/// <reference path="./vite-env.d.ts" />

/**
 * Omni Worker Web Demo — Application entry point.
 *
 * Mounts the tabbed single-page application to #app, initialises all
 * tab content, and wires up the global lifecycle hooks.
 *
 * @module main
 */

import './styles.css';
import { App } from './app';

/**
 * Bootstrap the application once the DOM is ready.
 */
document.addEventListener('DOMContentLoaded', (): void => {
  const root: HTMLElement | null = document.getElementById('app');
  if (!root) {
    throw new Error('[OmniWorker Demo] #app element not found in DOM');
  }
  new App(root).init();
});
