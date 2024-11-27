import React from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

// Custom error interface
interface CustomError extends Error {
    statusCode?: number;
}

// Error state interface
interface ErrorState {
    hasError: boolean;
    error: CustomError | null;
}

// Error fallback props interface
interface ErrorFallbackProps {
    error: CustomError;
    resetErrorBoundary: () => void;
}

// Error boundary props interface
interface ErrorBoundaryProps {
    children: ReactNode;
    fallback: React.ComponentType<ErrorFallbackProps>;
}

// Error fallback component
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
    error,
    resetErrorBoundary
}) => {
    return (
        <div role="alert" className="error-container">
            <h2>ချို့ယွင်းချက်တစ်ခု ဖြစ်ပွားနေပါသည်</h2>
            <pre className="error-message">{error.message}</pre>
            <button
                onClick={resetErrorBoundary}
                className="error-button"
            >
                ပြန်လည်ကြိုးစားကြည့်ပါ
            </button>
        </div>
    );
};

// Custom error boundary component
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorState {
        return {
            hasError: true,
            error: error as CustomError
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('Error caught:', error, errorInfo);
    }

    render(): ReactNode {
        if (this.state.hasError && this.state.error) {
            const Fallback = this.props.fallback;
            return (
                <Fallback
                    error={this.state.error}
                    resetErrorBoundary={() => this.setState({ hasError: false, error: null })}
                />
            );
        }

        return this.props.children;
    }
}

// Page with layout type
type NextPageWithLayout = NextPage & {
    getLayout?: (page: ReactElement) => ReactNode;
};

// App props with layout type
type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

// Main App component
const MyApp = ({ Component, pageProps }: AppPropsWithLayout): ReactNode => {
    const getLayout = Component.getLayout ?? ((page: ReactElement) => page);

    return getLayout(
        <React.StrictMode>
            <ErrorBoundary fallback={ErrorFallback}>
                <Component {...pageProps} />
            </ErrorBoundary>
        </React.StrictMode>
    );
};

export default MyApp; 