import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render-time crashes anywhere in the tree and shows a recoverable
 * message instead of a blank white screen in the hosted app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Justice GPT crashed:', error, info);
  }

  private handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f6f1] p-6 text-stone-950">
        <div className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            The app hit an unexpected error. Your saved reports are still stored in this browser.
            Reloading usually fixes it.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            Reload the app
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
