import { useEffect, useState } from 'react';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        // Total display time: 3 seconds
        // 2.5s waiting + 0.5s fade out
        const timer = setTimeout(() => {
            setShow(false);
            setTimeout(onFinish, 500); // Wait for fade out transition
        }, 2800);
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-white transition-all duration-700 ease-in-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
            <div className="relative">
                {/* Paint brush flow effect: Smooth linear reveal, no cursor, slightly slower duration */}
                <h1 className="text-6xl md:text-8xl text-black font-['Dancing_Script'] overflow-hidden whitespace-nowrap animate-[typing_3.5s_linear_forwards] pb-2">
                    Harry The Blaze
                </h1>
            </div>
        </div>
    );
};

export default SplashScreen;
