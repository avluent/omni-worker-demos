/**
 * Omni Worker React Demo — Application root.
 *
 * Single-page app with tabbed navigation (WAI-ARIA tab pattern),
 * custom hooks for worker lifecycle, and Error Boundary wrapping
 * each tab component.
 *
 * @module App
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { SingleWorkerTab } from './tabs/SingleWorkerTab';
import { WorkerPoolTab } from './tabs/WorkerPoolTab';
import { ErrorHandlingTab } from './tabs/ErrorHandlingTab';
import { LifecycleTab } from './tabs/LifecycleTab';

/* ── Types ─────────────────────────────────────────────────────── */

/** Identifiers and labels for each application tab. */
interface TabDefinition {
  id: string;
  label: string;
  component: ReactNode;
}

/** Possible visual states for the status footer. */
type StatusState = 'idle' | 'running' | 'success' | 'error';

/* ── Tab Data ──────────────────────────────────────────────────── */

const TABS: TabDefinition[] = [
  { id: 'single-worker', label: 'Single Worker', component: <SingleWorkerTab /> },
  { id: 'worker-pool', label: 'Worker Pool', component: <WorkerPoolTab /> },
  { id: 'error-handling', label: 'Error Handling', component: <ErrorHandlingTab /> },
  { id: 'lifecycle', label: 'Lifecycle', component: <LifecycleTab /> },
];

/* ── Error Boundary ────────────────────────────────────────────── */

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary component.
 *
 * Catches JavaScript errors in its child component tree and displays
 * a fallback UI instead of crashing the entire application.
 */
class ErrorBoundary extends React.Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="error-box"
          role="alert"
          aria-live="assertive"
        >
          <strong>Error in this section</strong>
          {'\n'}
          {this.state.error?.message ?? 'An unexpected error occurred'}
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Main App ──────────────────────────────────────────────────── */

interface AppProps {
  /** Callback fired whenever the global status changes. */
  onStatusChange?: (state: StatusState, message: string) => void;
}

/**
 * Main application component with tabbed navigation.
 *
 * Provides WAI-ARIA compliant tab pattern with keyboard navigation
 * and Error Boundary wrapping for each tab panel.
 */
export function App({ onStatusChange }: AppProps): JSX.Element {
  const [activeTabId, setActiveTabId] = useState<string>(TABS[0].id);
  const [statusState, setStatusState] = useState<StatusState>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Ready');

  // Refs for focus management during keyboard navigation
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const setStatus = useCallback(
    (state: StatusState, message: string) => {
      setStatusState(state);
      setStatusMessage(message);
      onStatusChange?.(state, message);
    },
    [onStatusChange],
  );

  // Report status changes to the parent via callback
  useEffect(() => {
    setStatus('idle', `${activeTabId.replace(/-/g, ' ')} tab selected`);
  }, [activeTabId, setStatus]);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const currentButton = e.currentTarget;
      const allTabs = tabRefs.current.filter((b) => b !== null) as HTMLButtonElement[];
      const currentIndex = allTabs.indexOf(currentButton);
      if (currentIndex === -1) return;

      let nextIndex: number = -1;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = (currentIndex + 1) % allTabs.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextIndex =
            (currentIndex - 1 + allTabs.length) %
            allTabs.length;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = allTabs.length - 1;
          break;
        case 'Escape':
          // Dismiss any active modal or error (handled by tab components)
          e.preventDefault();
          return;
        default:
          return;
      }

      if (nextIndex >= 0) {
        allTabs[nextIndex].focus();
        setActiveTabId(allTabs[nextIndex].dataset.tabid ?? activeTabId);
      }
    },
    [activeTabId],
  );

  return (
    <main
      className="app-container"
      id="tab-content"
      role="main"
    >
      {/* Skip link for accessibility */}
      <a href="#tab-content" className="skip-link">
        Skip to content
      </a>

      {/* Header */}
      <header className="app-header">
        <h1>Omni Worker — React Demo</h1>
        <p>
          React demo using{' '}
          <code>omniWorker()</code> and{' '}
          <code>omniWorkerPool()</code>
        </p>
      </header>

      {/* Tab list (WAI-ARIA tablist) */}
      <nav
        role="tablist"
        aria-label="Demo sections"
        className="tablist"
      >
        {TABS.map((tab, index) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              className="tab"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTabId(tab.id)}
              onKeyDown={handleKeyDown}
              data-tabid={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Tab panels */}
      {TABS.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <section
            key={tab.id}
            className="tabpanel"
            id={`panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            tabIndex={0}
            hidden={!isActive}
          >
            <ErrorBoundary>{tab.component}</ErrorBoundary>
          </section>
        );
      })}

      {/* Status footer */}
      <footer
        className={`status-footer${statusState !== 'idle' ? ` state-${statusState}` : ''}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {statusState === 'running' && (
          <span className="spinner" aria-hidden="true" />
        )}
        {statusMessage}
      </footer>
    </main>
  );
}
