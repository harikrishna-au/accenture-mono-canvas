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
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Header Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-indigo-600 px-8 py-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Interview Analysis</h1>
                                <p className="text-indigo-100 italic">"{data.summary}"</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl text-center">
                                <span className="block text-indigo-100 text-sm font-medium">Overall Rating</span>
                                <span className="text-4xl font-extrabold text-white">{data.rating}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                            {/* Strengths */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-green-700 font-bold text-lg">
                                    <CheckCircle className="w-6 h-6" />
                                    <h3>Key Strengths</h3>
                                </div>
                                <ul className="space-y-3">
                                    {data.strengths.map((item, idx) => (
                                        <li key={idx} className="flex gap-3 text-gray-700 bg-green-50 p-3 rounded-lg border border-green-100">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Improvements */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-amber-700 font-bold text-lg">
                                    <TrendingUp className="w-6 h-6" />
                                    <h3>Areas for Improvement</h3>
                                </div>
                                <ul className="space-y-3">
                                    {data.areas_for_improvement.map((item, idx) => (
                                        <li key={idx} className="flex gap-3 text-gray-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
                                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Analysis */}
                    {data.detailed_analysis && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Lightbulb className="w-6 h-6 text-indigo-600" />
                                Detailed Answer Coaching
                            </h2>
                            <div className="grid gap-6">
                                {data.detailed_analysis.map((item, idx) => (
                                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 transition hover:shadow-md">
                                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2">{item.topic}</h3>

                                        <div>
                                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Analysis</span>
                                            <p className="text-gray-700 mt-1">{item.analysis}</p>
                                        </div>

                                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                            <span className="text-sm font-semibold text-indigo-800 uppercase tracking-wider flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> Suggested Better Answer
                                            </span>
                                            <p className="text-gray-800 mt-2 italic font-medium">"{item.better_answer_example}"</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 justify-center pt-8">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-200"
                        >
                            Start New Session
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-8 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition shadow-sm"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};
