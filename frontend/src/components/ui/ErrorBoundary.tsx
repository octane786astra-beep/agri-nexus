'use client';

/**
 * Error Boundary Component
 * ========================
 * Catches React errors and displays a fallback UI.
 */

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    children: ReactNode;
    fallbackMessage?: string;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center min-h-[200px] p-8 backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl"
                >
                    <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
                    <h3 className="text-white font-semibold mb-2">
                        {this.props.fallbackMessage || 'Something went wrong'}
                    </h3>
                    <p className="text-white/60 text-sm mb-4 text-center max-w-md">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    <motion.button
                        onClick={this.handleRetry}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </motion.button>
                </motion.div>
            );
        }

        return this.props.children;
    }
}

/**
 * Wrapper for individual components
 */
export function withErrorBoundary<T extends object>(
    Component: React.ComponentType<T>,
    fallbackMessage?: string
) {
    return function WrappedComponent(props: T) {
        return (
            <ErrorBoundary fallbackMessage={fallbackMessage}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}
