import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
                    <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-red-100 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 mb-2">That didn't work</h1>
                        <p className="text-slate-500 mb-2 text-sm">
                            Something broke on our end. Let's try again.
                        </p>
                        <p className="text-slate-400 mb-6 text-xs">
                            If this keeps happening, drop us a message.
                        </p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full rounded-xl"
                        >
                            Try Again
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => window.location.href = '/'}
                            className="w-full mt-2"
                        >
                            Back to Home
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
