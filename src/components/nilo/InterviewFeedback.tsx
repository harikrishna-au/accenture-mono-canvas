import { CheckCircle } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { useNavigate } from "react-router-dom";

export const InterviewFeedback = () => {
    const navigate = useNavigate();

    return (
        <PageWrapper>
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-6 bg-neutral-50/50">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Interview Completed</h1>
                        <p className="text-gray-500">
                            Thank you for practicing with Sarah. Your session has been recorded (simulated).
                        </p>
                    </div>
                    <div className="pt-4 space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                        >
                            Start New Session
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};
