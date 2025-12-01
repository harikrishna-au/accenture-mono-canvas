import { Monitor, Smartphone } from "lucide-react";

const MobileRestriction = () => {
    return (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-8 text-center md:hidden">
            <div className="relative mb-8">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                    <Smartphone className="w-10 h-10 text-red-400" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center border-4 border-white">
                    <Monitor className="w-5 h-5 text-white" />
                </div>
            </div>

            <h1 className="text-3xl font-black text-neutral-900 mb-4 tracking-tight">Desktop Only</h1>
            <p className="text-lg text-neutral-600 max-w-xs mx-auto font-medium leading-relaxed">
                This experience is optimized for desktop. Please switch to a larger screen to continue.
            </p>
        </div>
    );
};

export default MobileRestriction;
