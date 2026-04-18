import { Component, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: { componentStack: string }) {
        console.error("ErrorBoundary caught:", error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return (
                <div className="min-h-screen flex items-center justify-center" style={{ background: "#fcfcf9" }}>
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 max-w-md w-full text-center">
                        <p className="font-['Merriweather'] text-xl font-bold text-stone-900 mb-2">Something went wrong</p>
                        <p className="font-['Inter'] text-sm text-stone-500 mb-6">
                            {this.state.error?.message || "An unexpected error occurred."}
                        </p>
                        <button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="px-5 py-2.5 bg-stone-900 text-white rounded-xl font-['Inter'] text-sm hover:bg-stone-700 active:scale-95 transition-all"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
