import { CheckCircle, AlertCircle, TrendingUp, Lightbulb } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { useNavigate } from "react-router-dom";

interface DetailedAnalysisItem {
    topic: string;
    analysis: string;
    better_answer_example: string;
}

interface FeedbackData {
    feedback: {
        strengths: string[];
        areas_for_improvement: string[];
        rating: string;
        summary: string;
        detailed_analysis?: DetailedAnalysisItem[];
    }
}

interface InterviewFeedbackProps {
    feedback?: FeedbackData;
}

export const InterviewFeedback = ({ feedback }: InterviewFeedbackProps) => {
    const navigate = useNavigate();

    const data = feedback?.feedback;

    if (!data) {
        return (
            <PageWrapper>
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-6 bg-neutral-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-700">Generating Detailed Feedback...</h2>
                    <p className="text-gray-500">Analysing your answers and speech patterns</p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="min-h-screen bg-[#fcfcf9] py-12 px-4 sm:px-6 lg:px-8 font-sans">
                <div className="max-w-5xl mx-auto space-y-12">

                    {/* Minimal Header */}
                    <div className="text-center space-y-4 animate-in slide-in-from-top-4 fade-in duration-700">
                        <span className="inline-block px-3 py-1 bg-stone-100 text-stone-500 text-xs font-bold uppercase tracking-widest rounded-full">
                            Report Generated
                        </span>
                        <h1 className="text-4xl md:text-5xl font-serif text-stone-900 leading-tight">
                            Performance Analysis
                        </h1>
                        <p className="text-stone-500 max-w-2xl mx-auto text-lg leading-relaxed font-light">
                            "{data.summary}"
                        </p>
                    </div>

                    {/* Score Card - Hero */}
                    <div className="bg-white rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/50 p-8 md:p-12 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-stone-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
                            <div className="text-center md:text-left">
                                <span className="text-stone-400 text-sm font-bold uppercase tracking-wider mb-2 block">Overall Score</span>
                                <div className="text-7xl md:text-8xl font-serif text-stone-800 tracking-tighter">
                                    {data.rating}
                                </div>
                            </div>

                            <div className="h-px w-full md:w-px md:h-32 bg-stone-100" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
                                {/* Strengths */}
                                <div>
                                    <h3 className="flex items-center gap-2 text-emerald-700 font-bold mb-4 uppercase text-xs tracking-widest">
                                        <CheckCircle className="w-4 h-4" /> Key Strengths
                                    </h3>
                                    <ul className="space-y-3">
                                        {data.strengths.map((item, idx) => (
                                            <li key={idx} className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Improvements */}
                                <div>
                                    <h3 className="flex items-center gap-2 text-amber-600 font-bold mb-4 uppercase text-xs tracking-widest">
                                        <TrendingUp className="w-4 h-4" /> Focus Areas
                                    </h3>
                                    <ul className="space-y-3">
                                        {data.areas_for_improvement.map((item, idx) => (
                                            <li key={idx} className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 shrink-0"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Analysis */}
                    {data.detailed_analysis && (
                        <div className="space-y-8">
                            <h2 className="text-2xl font-serif text-stone-800 border-b border-stone-200 pb-4">
                                Detailed Coaching
                            </h2>
                            <div className="grid gap-6">
                                {data.detailed_analysis.map((item, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-stone-100 p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                                        <div className="flex flex-col md:flex-row gap-8">
                                            <div className="flex-1 space-y-4">
                                                <h3 className="text-lg font-bold text-stone-800">{item.topic}</h3>
                                                <div>
                                                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">Analysis</span>
                                                    <p className="text-stone-600 leading-relaxed font-light">{item.analysis}</p>
                                                </div>
                                            </div>

                                            <div className="md:w-1/3 bg-stone-50 rounded-xl p-6 border border-stone-100 flex-shrink-0">
                                                <span className="flex items-center gap-2 text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">
                                                    <Lightbulb className="w-4 h-4 text-amber-500" /> Pro Tip
                                                </span>
                                                <p className="text-stone-700 italic text-sm leading-relaxed">"{item.better_answer_example}"</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 justify-center pt-8 pb-20">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            Start New Session
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-8 py-3 bg-white text-stone-600 border border-stone-200 rounded-full font-bold hover:bg-stone-50 transition shadow-sm hover:border-stone-300"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};
