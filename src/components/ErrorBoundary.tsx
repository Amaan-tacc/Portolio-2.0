import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 studio-canvas-bg text-[#1C1D1E] dark:text-white">
          <div className="max-w-lg w-full rounded-[28px] bg-white/75 dark:bg-[#1E2025]/85 backdrop-blur-2xl border border-black/10 dark:border-white/15 p-8 shadow-2xl space-y-4 text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F8B033]">
              Amaanity Studio
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Something went wrong
            </h1>
            <p className="text-sm text-[#434445] dark:text-white/70 break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-full bg-[#1C1D1E] dark:bg-white text-white dark:text-[#1C1D1E] px-6 py-2.5 text-sm font-semibold hover:bg-[#F8B033] hover:text-[#1C1D1E] transition-colors duration-300 ease-out cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
