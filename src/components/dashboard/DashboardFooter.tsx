
import { MessageSquare, Coffee, Youtube, Linkedin, Mail, Heart } from "lucide-react";

interface DashboardFooterProps {
    onFeedbackClick: () => void;
    onSupportClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export const DashboardFooter = ({ onFeedbackClick, onSupportClick, onMouseEnter, onMouseLeave }: DashboardFooterProps) => {
    return (
        <div
            className="w-full py-24 flex flex-col items-center justify-center relative z-50 pointer-events-none"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="pointer-events-auto flex flex-col items-center gap-8">

                {/* Main Actions Card */}
                <div className="bg-[#f5f5f0] px-8 py-5 rounded-2xl border border-stone-200 shadow-sm flex flex-wrap justify-center items-center gap-6 transition-all duration-500">
                    <span className="font-medium text-stone-600 font-['Merriweather'] italic">Enjoying the practice?</span>

                    <button
                        onClick={onFeedbackClick}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-xl font-semibold hover:border-stone-400 hover:text-stone-900 transition-all active:scale-95 font-['Inter']"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Feedback
                    </button>

                    <button
                        onClick={onSupportClick}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#e8dcb5] text-[#5c4b35] border border-[#d4c5a0] rounded-xl font-semibold hover:bg-[#decfa5] transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm font-['Inter']"
                    >
                        <Coffee className="w-4 h-4" />
                        Buy me a chai
                    </button>
                </div>

                {/* Developer / Social Section */}
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-stone-400 text-xs uppercase tracking-widest font-medium">
                        <span>Crafted by Hari Krishna</span>
                        <Heart className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse" />
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href="https://www.youtube.com/@HARIKRISHNA-AU"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-white border border-stone-200 rounded-full text-stone-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all duration-300"
                            title="YouTube"
                        >
                            <Youtube className="w-4 h-4" />
                        </a>
                        <a
                            href="https://www.linkedin.com/in/hari-krishna-nallana-33949b277/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-white border border-stone-200 rounded-full text-stone-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300"
                            title="LinkedIn"
                        >
                            <Linkedin className="w-4 h-4" />
                        </a>
                        <a
                            href="mailto:nallanahk@gmail.com"
                            className="p-2.5 bg-white border border-stone-200 rounded-full text-stone-500 hover:text-stone-900 hover:border-stone-400 hover:bg-stone-50 transition-all duration-300"
                            title="Contact Me"
                        >
                            <Mail className="w-4 h-4" />
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
};
