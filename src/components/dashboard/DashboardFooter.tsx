
import { useNavigate } from "react-router-dom";
import { MessageSquare, Coffee, Youtube, Linkedin, Mail, Heart, Building2, ArrowUpRight } from "lucide-react";

interface DashboardFooterProps {
    onFeedbackClick: () => void;
    onSupportClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export const DashboardFooter = ({ onFeedbackClick, onSupportClick, onMouseEnter, onMouseLeave }: DashboardFooterProps) => {
    const navigate = useNavigate();

    return (
        <div
            className="w-full bg-[#fcfcf9] relative overflow-hidden"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Subtle ambient orbs in the background */}
            <div
                className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
                style={{
                    background: "radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 70%)",
                    transform: "translate(-50%, -50%)",
                }}
            />
            <div
                className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
                style={{
                    background: "radial-gradient(circle, rgba(217,119,6,0.04) 0%, transparent 70%)",
                    transform: "translate(50%, 50%)",
                }}
            />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 flex flex-col items-center gap-10">

                {/* Section badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 text-stone-500 text-[10.5px] font-semibold tracking-[0.2em] uppercase font-['Inter']">
                    <Heart className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse" />
                    Made with love
                </div>

                {/* Main heading — matches bento hero typography */}
                <div className="text-center space-y-3">
                    <h2 className="text-4xl md:text-[3.1rem] font-serif text-stone-800 tracking-tight leading-[1.1]">
                        Enjoying the practice?
                        <br />
                        <span className="text-stone-400 font-light italic">Let us know.</span>
                    </h2>
                    <p className="text-stone-500 text-[0.9rem] font-light font-['Inter'] max-w-sm mx-auto leading-relaxed">
                        Your feedback shapes this platform. Every message is read personally.
                    </p>
                </div>

                {/* Action buttons — matching bento tile button style */}
                <div className="flex flex-wrap justify-center items-center gap-3">
                    <button
                        onClick={onFeedbackClick}
                        className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-[13.5px] font-['Inter'] transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                        style={{
                            background: "#ffffff",
                            border: "1px solid rgba(0,0,0,0.09)",
                            color: "#1c1c1e",
                            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        }}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Share Feedback
                    </button>

                    <button
                        onClick={onSupportClick}
                        className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-[13.5px] font-['Inter'] transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                        style={{
                            background: "linear-gradient(135deg, #e8dcb5 0%, #d9c99e 100%)",
                            border: "1px solid rgba(180,145,70,0.2)",
                            color: "#5c4b35",
                            boxShadow: "0 2px 12px rgba(180,145,70,0.18)",
                        }}
                    >
                        <Coffee className="w-4 h-4" />
                        Buy me a chai
                    </button>
                </div>

                {/* Divider */}
                <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

                {/* All about Infosys — sole entry into Infosys-themed prep */}
                <button
                    onClick={() => navigate("/hackwithinfy")}
                    className="w-full max-w-md flex items-center justify-between gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] group"
                    style={{
                        background: "linear-gradient(135deg, rgba(0,124,195,0.08) 0%, rgba(0,124,195,0.03) 100%)",
                        border: "1px solid rgba(0,124,195,0.2)",
                        boxShadow: "0 2px 14px rgba(0,124,195,0.08)",
                    }}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                                background: "rgba(0,124,195,0.1)",
                                border: "1px solid rgba(0,124,195,0.18)",
                            }}
                        >
                            <Building2 className="w-4.5 h-4.5" style={{ color: "#007CC3", width: 18, height: 18 }} />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[14px] font-bold font-['Inter'] text-stone-800 leading-tight">
                                All about Infosys
                            </div>
                            <div className="text-[12px] font-['Inter'] text-stone-500 mt-0.5">
                                HackWithInfy prep, roles & interview resources
                            </div>
                        </div>
                    </div>
                    <ArrowUpRight
                        className="w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        style={{ color: "#007CC3" }}
                    />
                </button>

                {/* Social / Creator section */}
                <div className="flex flex-col items-center gap-5">
                    <p className="text-stone-400 text-[11px] uppercase tracking-[0.22em] font-medium font-['Inter']">
                        Crafted by Hari Krishna
                    </p>

                    {/* Social links — pill style with labels */}
                    <div className="flex items-center gap-2.5">
                        <a
                            href="https://www.youtube.com/@HARIKRISHNA-AU"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all duration-300 text-[12px] font-semibold font-['Inter']"
                        >
                            <Youtube className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">YouTube</span>
                        </a>
                        <a
                            href="https://www.linkedin.com/in/hari-krishna-nallana-33949b277/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 text-[12px] font-semibold font-['Inter']"
                        >
                            <Linkedin className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">LinkedIn</span>
                        </a>
                        <a
                            href="mailto:nallanahk@gmail.com"
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-stone-900 hover:border-stone-400 transition-all duration-300 text-[12px] font-semibold font-['Inter']"
                        >
                            <Mail className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Email</span>
                        </a>
                    </div>

                    {/* Copyright */}
                    <p className="text-stone-300 text-[11px] font-['Inter'] tracking-wide text-center">
                        © 2026 Harry The Blaze · Interview Intelligence Platform
                    </p>
                </div>

            </div>
        </div>
    );
};
