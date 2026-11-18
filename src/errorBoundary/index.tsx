import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button, StateMessage } from '@/components';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Last line of defence for unexpected render errors, so a bug shows a
 * recoverable message instead of a blank page. Expected failures (network,
 * not found) are handled where they happen and never reach this.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // A real deployment would report this to an error-tracking service.
    console.error('Unhandled UI error', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <StateMessage
        icon="critical"
        tone="critical"
        title="Something went wrong"
        description="Fleet Health hit an unexpected error. Reloading usually fixes it."
        action={
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reload
          </Button>
        }
        role="alert"
      />
    );
  }
}
