import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="bg-[#0f172a] border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
                        <div className="bg-red-500/10 p-4 rounded-full inline-flex mb-6">
                            <AlertTriangle size={48} className="text-red-400" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-4">
                            Something went wrong
                        </h2>

                        <p className="text-slate-400 mb-6">
                            An unexpected error occurred. Please try refreshing the page or click the button below to retry.
                        </p>

                        {this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-400">
                                    Error details
                                </summary>
                                <pre className="mt-2 p-3 bg-slate-900 rounded-lg text-xs text-red-400 overflow-auto max-h-32">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}

                        <button
                            onClick={this.handleRetry}
                            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-6 py-3 rounded-xl font-bold transition-colors"
                        >
                            <RefreshCw size={18} />
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;