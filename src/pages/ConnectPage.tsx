import React from 'react';
import { Bot, Sparkles, MessageSquare, ArrowLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';

const ConnectPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#fcfcf9] text-stone-900 font-sans selection:bg-stone-200">
            <div className={`w-full flex flex-col items-center transition-all duration-700 z-50`}>
                <Header onStartTour={() => { }} />
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <button
                    onClick={() => navigate('/')}
                    className="group flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-12"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium tracking-wide">Exit</span>
                </button>

                {/* Cool Hero Header */}
                <div className="relative flex flex-col items-center justify-center text-center mb-24 space-y-8 pt-16 w-full">
                    {/* Clean, seamless color blend */}
                    <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-50 pointer-events-none">
                        <div className="absolute w-64 h-64 md:w-80 md:h-80 bg-emerald-200 rounded-full mix-blend-multiply blur-3xl -translate-x-20 -translate-y-4" />
                        <div className="absolute w-64 h-64 md:w-80 md:h-80 bg-sky-200 rounded-full mix-blend-multiply blur-3xl translate-x-10 translate-y-10" />
                        <div className="absolute w-64 h-64 md:w-80 md:h-80 bg-indigo-200 rounded-full mix-blend-multiply blur-3xl translate-x-32 -translate-y-8" />
                    </div>

                    <div className="relative inline-flex items-center group mt-8">
                        {/* Direct glowing light directly behind the text - Made much brighter and wider */}
                        <div className="absolute -inset-8 bg-yellow-400 rounded-full blur-[60px] opacity-40 -z-10 group-hover:opacity-70 transition-opacity duration-700" />
                        <div className="absolute -inset-4 bg-amber-500 rounded-full blur-[40px] opacity-30 -z-10 group-hover:opacity-60 transition-opacity duration-700" />

                        {/* Solid text color with a very subtle gradient */}
                        <h1 className="text-7xl md:text-9xl font-serif tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-stone-800 to-stone-600 z-10 pb-4">
                            Connect.
                        </h1>
                        <Sparkles className="absolute -top-4 -right-12 w-10 h-10 text-emerald-400 animate-pulse opacity-100 transition-opacity duration-700 z-20" />
                        <Bot className="absolute -bottom-2 -left-10 w-8 h-8 text-sky-400 opacity-100 group-hover:-translate-y-2 transition-all duration-700 z-20" />
                    </div>

                    <p className="text-xl md:text-2xl text-stone-500 max-w-2xl font-light leading-relaxed mt-4">
                        Learn directly from peers who just cracked the same interviews.
                    </p>

                    {/* Company Filter Scroll (Marquee style) */}
                    <div className="w-full max-w-4xl mt-12 overflow-hidden relative pb-4">
                        {/* Fade edges */}
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#fcfcf9] to-transparent z-10" />
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#fcfcf9] to-transparent z-10" />

                        <div className="flex items-center gap-4 min-w-max px-4 animate-scroll-left hover:[animation-play-state:paused]">
                            {[
                                { name: 'All', locked: false },
                                { name: 'Accenture', locked: false },
                                { name: 'Infosys', locked: false },
                                { name: 'Cognizant', locked: false },
                                { name: 'TCS', locked: false },
                                { name: 'Wipro', locked: true },
                                { name: 'IBM', locked: true },
                                // Duplicate for seamless infinite scroll
                                { name: 'All', locked: false },
                                { name: 'Accenture', locked: false },
                                { name: 'Infosys', locked: false },
                                { name: 'Cognizant', locked: false },
                                { name: 'TCS', locked: false },
                                { name: 'Wipro', locked: true },
                                { name: 'IBM', locked: true }
                            ].map((company, i) => (
                                <button
                                    key={`${company.name}-${i}`}
                                    disabled={company.locked}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap
                                        ${i === 0
                                            ? 'bg-stone-900 text-white shadow-md'
                                            : company.locked
                                                ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed opacity-70'
                                                : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400 hover:text-stone-900 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                                        }`}
                                >
                                    {company.name}
                                    {company.locked && <Lock className="w-3 h-3 text-stone-400" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 text-center py-20">
                    <Sparkles className="w-12 h-12 text-stone-300 mx-auto mb-6" />
                    <h2 className="text-2xl font-serif text-stone-800 mb-4">Coming Soon</h2>
                    <p className="text-stone-500 max-w-md mx-auto">
                        We're building a new way to connect. Check back later for updates!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConnectPage;
