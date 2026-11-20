import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

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
    let readable = error.message || 'An unexpected error occurred.';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed.error === 'string') {
        readable = `Database access error (${parsed.operationType}): ${parsed.error}`;
      }
    } catch {
      // Standard non-JSON error message
    }
    return { hasError: true, message: readable };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Application ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#DEE0DF] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#F2F2F2] border border-[#036A39]/15 rounded-xl p-8">
            <div className="flex items-center gap-3 text-[#036A39] mb-4">
              <AlertTriangle className="w-6 h-6 text-[#C0A14E] shrink-0" />
              <h1 className="text-xl font-semibold">Something went wrong</h1>
            </div>
            <p className="text-sm text-[#023B1F]/80 leading-relaxed mb-6">
              {this.state.message}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, message: '' });
                  window.location.href = '/';
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#036A39] text-[#F2F2F2] text-sm font-medium rounded-lg hover:bg-[#024D29] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
