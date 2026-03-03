import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Sparkles, Lock, Search, Loader2, CalendarDays, UserPlus, ChevronDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import ExpertCard, { Expert } from './connect/ExpertCard';
import BookingScreen from './connect/BookingScreen';
import MyBookingsModal from './connect/MyBookingsModal';
import DMModal from './connect/DMModal';

const ConnectPage = () => {
    const navigate = useNavigate();
    const { expertId } = useParams<{ expertId?: string }>();
    const [experts, setExperts] = useState<Expert[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
    const [dmExpert, setDmExpert] = useState<Expert | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('All');
    const [showMyBookings, setShowMyBookings] = useState(false);

    const COMPANIES = ['All', 'Accenture', 'Infosys', 'Cognizant', 'TCS', 'Wipro', 'IBM'];

    // Smooth ticker scroll — no CSS animation so speed changes never reset position
    const tickerRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const posRef = useRef(0);
    const currentSpeedRef = useRef(1);   // px per frame, interpolated
    const targetSpeedRef = useRef(1);    // 1 = normal, 0.25 = slow
    const halfWidthRef = useRef(0);

    useEffect(() => {
        const el = tickerRef.current;
        if (!el) return;
        // Measure after first paint so children have rendered
        const measure = () => { halfWidthRef.current = el.scrollWidth / 2; };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);

        const tick = () => {
            // Smooth lerp toward target speed
            currentSpeedRef.current += (targetSpeedRef.current - currentSpeedRef.current) * 0.06;
            posRef.current -= currentSpeedRef.current;
            if (halfWidthRef.current > 0 && posRef.current <= -halfWidthRef.current) {
                posRef.current += halfWidthRef.current;
            }
            if (tickerRef.current) {
                tickerRef.current.style.transform = `translateX(${posRef.current}px)`;
            }
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);

        return () => {
            ro.disconnect();
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const handleTickerEnter = useCallback(() => { targetSpeedRef.current = 0.25; }, []);
    const handleTickerLeave = useCallback(() => { targetSpeedRef.current = 1; }, []);

    useEffect(() => {
        const fetchExperts = async () => {
            setLoading(true);
            try {
                const { data } = await supabase
                    .from('experts')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (data) setExperts(data as unknown as Expert[]);
            } catch {
                // Network error — experts list stays empty, page still renders
            } finally {
                setLoading(false);
            }
        };
        fetchExperts();
    }, []);

    // When navigating directly to /connect/:expertId, fetch and open that expert
    useEffect(() => {
        if (!expertId) {
            setSelectedExpert(null);
            return;
        }
        supabase
            .from('experts')
            .select('*')
            .eq('id', expertId)
            .single()
            .then(({ data }) => {
                if (data) setSelectedExpert(data as unknown as Expert);
            });
    }, [expertId]);

    const handleBook = (expert: Expert) => {
        navigate(`/connect/${expert.id}`);
    };

    const handleClose = () => {
        setSelectedExpert(null);
        navigate('/connect');
    };

    const filteredExperts = experts.filter((e) => {
        const matchesCompany = selectedCompany === 'All' || (e.company?.toLowerCase() === selectedCompany.toLowerCase());
        if (!matchesCompany) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            e.name.toLowerCase().includes(q) ||
            (e.title?.toLowerCase().includes(q)) ||
            (e.bio?.toLowerCase().includes(q)) ||
            (e.skills?.some((s) => s.toLowerCase().includes(q)))
        );
    });

    return (
        <div className="min-h-screen bg-[#fcfcf9] text-stone-900 font-sans selection:bg-stone-200 overflow-x-hidden">
            <div className={`w-full flex flex-col items-center transition-all duration-700 z-50`}>
                <Header onStartTour={() => { }} />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Hero Header — preserving original design */}
                <div className="relative flex flex-col items-center justify-center text-center mb-8 md:mb-16 space-y-6 sm:space-y-8 pt-16 w-full">
                    <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-50 pointer-events-none">
                        <div className="absolute w-64 h-64 md:w-80 md:h-80 bg-emerald-200 rounded-full mix-blend-multiply blur-3xl -translate-x-20 -translate-y-4" />
                        <div className="absolute w-64 h-64 md:w-80 md:h-80 bg-sky-200 rounded-full mix-blend-multiply blur-3xl translate-x-10 translate-y-10" />
                        <div className="absolute w-64 h-64 md:w-80 md:h-80 bg-indigo-200 rounded-full mix-blend-multiply blur-3xl translate-x-32 -translate-y-8" />
                    </div>

                    <div className="relative inline-flex items-center group mt-8">
                        <div className="absolute -inset-8 bg-yellow-400 rounded-full blur-[60px] opacity-40 -z-10 group-hover:opacity-70 transition-opacity duration-700" />
                        <div className="absolute -inset-4 bg-amber-500 rounded-full blur-[40px] opacity-30 -z-10 group-hover:opacity-60 transition-opacity duration-700" />
                        <h1 className="text-5xl sm:text-7xl md:text-9xl font-serif tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-stone-800 to-stone-600 z-10 pb-4">
                            Connect.
                        </h1>
                        <Sparkles className="absolute -top-3 -right-8 sm:-top-4 sm:-right-12 w-7 h-7 sm:w-10 sm:h-10 text-emerald-400 animate-pulse opacity-100 transition-opacity duration-700 z-20" />
                        <Bot className="absolute -bottom-2 -left-7 sm:-left-10 w-6 h-6 sm:w-8 sm:h-8 text-sky-400 opacity-100 group-hover:-translate-y-2 transition-all duration-700 z-20" />
                    </div>

                    <p className="text-base sm:text-xl md:text-2xl text-stone-500 max-w-2xl font-light leading-relaxed mt-2 sm:mt-4 px-4 sm:px-0">
                        Learn directly from peers who just cracked the same interviews.
                    </p>

                    {/* Company Filter Scroll */}
                    <div
                        className="w-full max-w-4xl mt-12 overflow-hidden relative pb-4"
                        onMouseEnter={handleTickerEnter}
                        onMouseLeave={handleTickerLeave}
                    >
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#fcfcf9] to-transparent z-10" />
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#fcfcf9] to-transparent z-10" />
                        <div ref={tickerRef} className="flex items-center gap-4 min-w-max px-4">
                            {[
                                { name: 'All', locked: false },
                                { name: 'Accenture', locked: false },
                                { name: 'Infosys', locked: false },
                                { name: 'Cognizant', locked: false },
                                { name: 'TCS', locked: false },
                                { name: 'Wipro', locked: true },
                                { name: 'IBM', locked: true },
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

                {/* Search + Willing to Share + My Bookings */}
                <div className="flex flex-col gap-3 mb-8">
                    {/* Row 1: Company dropdown + Search input */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="relative flex-shrink-0">
                            <select
                                value={selectedCompany}
                                onChange={(e) => setSelectedCompany(e.target.value)}
                                className="appearance-none pl-3 sm:pl-4 pr-8 sm:pr-9 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 font-medium font-['Inter'] focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent transition-all shadow-sm cursor-pointer hover:border-stone-400"
                            >
                                {COMPANIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        </div>
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, skill, or company..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent transition-all font-['Inter']"
                            />
                        </div>
                    </div>
                    {/* Row 2: Action buttons — full width on mobile, auto on desktop */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/placed-guru')}
                            className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-sm font-medium font-['Inter'] transition-all shadow-sm hover:shadow-md"
                        >
                            <UserPlus className="w-4 h-4 flex-shrink-0" />
                            <span className="sm:hidden">Share Experience</span>
                            <span className="hidden sm:inline">Willing to Share Your Experience?</span>
                        </button>
                        <button
                            onClick={() => setShowMyBookings(true)}
                            className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-600 rounded-xl text-sm font-medium font-['Inter'] hover:border-stone-400 hover:text-stone-900 transition-all shadow-sm"
                        >
                            <CalendarDays className="w-4 h-4 flex-shrink-0" />
                            My Bookings
                        </button>
                    </div>
                </div>

                {/* Expert Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
                        <span className="text-stone-400 text-sm font-['Inter']">Finding experts...</span>
                    </div>
                ) : filteredExperts.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 text-center py-20">
                        <Sparkles className="w-12 h-12 text-stone-300 mx-auto mb-6" />
                        {experts.length === 0 ? (
                            <>
                                <h2 className="text-2xl font-serif text-stone-800 mb-4">Coming Soon</h2>
                                <p className="text-stone-500 max-w-md mx-auto">
                                    We're onboarding mentors right now. Check back soon!
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl font-serif text-stone-800 mb-3">No matches found</h2>
                                <p className="text-stone-500 text-sm">Try searching for a different skill or name.</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredExperts.map((expert) => (
                            <ExpertCard
                                key={expert.id}
                                expert={expert}
                                onBook={handleBook}
                                onMessage={(e) => setDmExpert(e)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {dmExpert && (
                <DMModal expert={dmExpert} onClose={() => setDmExpert(null)} />
            )}

            {selectedExpert && (
                <BookingScreen
                    expert={selectedExpert}
                    onClose={handleClose}
                />
            )}
            {showMyBookings && (
                <MyBookingsModal onClose={() => setShowMyBookings(false)} />
            )}
        </div>
    );
};

export default ConnectPage;
