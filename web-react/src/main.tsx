/**
 * Omni Worker React Demo — Application entry point.
 *
 * Mounts the React application to #root.
 *
 * @module main
 */

import './styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

/**
 * Bootstrap the React application once the DOM is ready.
 */
const rootElement: HTMLElement | null = document.getElementById('root');
if (!rootElement) {
  throw new Error('[OmniWorker React Demo] #root element not found in DOM');
}

const root: ReactDOM.Root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
