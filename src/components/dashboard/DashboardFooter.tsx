
import { MessageSquare, Coffee } from "lucide-react";

interface DashboardFooterProps {
    onFeedbackClick: () => void;
    onSupportClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export const DashboardFooter = ({ onFeedbackClick, onSupportClick, onMouseEnter, onMouseLeave }: DashboardFooterProps) => {
    return (
        <div
            className="w-full py-8 border-t border-neutral-100 flex flex-col items-center justify-center relative z-50 bg-white/80 backdrop-blur-md"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="group relative flex flex-wrap justify-center items-center gap-4 bg-neutral-50 px-8 py-4 rounded-2xl border border-neutral-200 shadow-sm mx-4">
                <span className="font-bold text-neutral-900 text-lg mr-2">Enjoying the practice?</span>

                <button
                    onClick={onFeedbackClick}
                    className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-neutral-200 text-neutral-700 rounded-xl font-bold hover:bg-neutral-50 hover:border-neutral-300 transition-all hover:scale-105 active:scale-95"
                >
                    <MessageSquare className="w-5 h-5" />
                    Feedback
                </button>

                <button
                    onClick={onSupportClick}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-yellow-900 rounded-xl font-bold hover:bg-yellow-500 transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                    <Coffee className="w-5 h-5" />
                    Buy me a chai
                </button>

                <div className="absolute bottom-full left-0 right-0 mb-4 flex justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 ease-out pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.1)] border border-neutral-100 flex items-center gap-1.5 whitespace-nowrap group-hover:shadow-[0_0_30px_rgba(255,50,50,0.3)] transition-shadow duration-700">
                        <span className="text-neutral-400 font-medium text-sm">Designed and developed by</span>
                        <span className="text-neutral-900 font-bold text-sm">Hari Krishna</span>
                        <span className="text-neutral-400 font-medium text-sm">with</span>
                        <span className="text-red-500 animate-pulse text-sm">❤️</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
