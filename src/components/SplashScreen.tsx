import { useEffect, useState } from 'react';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
    const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

    useEffect(() => {
        // Phase in: 0.8s fade-in
        // Hold: 3s
        // Phase out: 0.7s fade-out
        const holdTimer = setTimeout(() => setPhase('out'), 3800);
        const doneTimer = setTimeout(() => {
            onFinish();
        }, 4500);
        return () => {
            clearTimeout(holdTimer);
            clearTimeout(doneTimer);
        };
    }, [onFinish]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-700 ease-in-out"
            style={{
                background: 'linear-gradient(135deg, #18181a 0%, #2c2b2e 100%)',
                opacity: phase === 'out' ? 0 : 1,
                pointerEvents: phase === 'out' ? 'none' : 'auto',
            }}
        >
            {/* Ambient glow behind logo */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(219,168,76,0.08) 0%, transparent 70%)',
                }}
            />

            <div
                className="relative flex flex-col items-center gap-5"
                style={{
                    animation: 'splashFadeUp 0.8s cubic-bezier(0.22,1,0.36,1) forwards',
                }}
            >
                {/* Full wordmark */}
                <img
                    src="/logo.svg"
                    alt="Harry The Blaze"
                    className="w-72 md:w-96"
                    style={{ filter: 'drop-shadow(0 8px 32px rgba(219,168,76,0.25))' }}
                />

                {/* Animated underline */}
                <div
                    className="h-px rounded-full"
                    style={{
                        background: 'linear-gradient(90deg, transparent, #dba84c, transparent)',
                        animation: 'splashLine 1.2s cubic-bezier(0.22,1,0.36,1) 0.4s forwards',
                        width: 0,
                    }}
                />
            </div>
        </div>
    );
};

export default SplashScreen;
