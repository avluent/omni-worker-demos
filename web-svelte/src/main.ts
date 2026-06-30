/**
 * Omni Worker Svelte Demo — Application entry point.
 *
 * Mounts the Svelte single-page application to #app.
 *
 * @module main
 */

import './styles.css';
import App from './App.svelte';

/**
 * Bootstrap the Svelte application.
 */
const app = new App({
  target: document.getElementById('app')!,
});

export default app;
