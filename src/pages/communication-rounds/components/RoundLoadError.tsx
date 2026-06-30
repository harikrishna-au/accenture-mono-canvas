import { Button } from '@/components/ui/button';
import { WifiOff, RotateCw } from 'lucide-react';

interface RoundLoadErrorProps {
    onRetry: () => void;
    message?: string;
}

/**
 * Shown when a round's questions fail to load (backend/network issue).
 * Prevents the broken state where a user is asked to answer a question
 * that never rendered.
 */
export function RoundLoadError({ onRetry, message }: RoundLoadErrorProps) {
    return (
        <div className="text-center py-12 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                <WifiOff className="w-6 h-6 text-amber-600" />
            </div>
            <div className="space-y-1">
                <h3 className="text-lg font-bold text-neutral-900">Couldn't load this question</h3>
                <p className="text-sm text-neutral-600 max-w-sm">
                    {message || "We couldn't reach the question server. This is usually temporary — check your connection and try again."}
                </p>
            </div>
            <Button onClick={onRetry} className="bg-neutral-900 hover:bg-neutral-800 h-11 px-6 gap-2">
                <RotateCw className="w-4 h-4" />
                Retry
            </Button>
        </div>
    );
}
