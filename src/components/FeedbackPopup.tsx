import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, MessageSquare, Send } from "lucide-react";

interface FeedbackPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const FeedbackPopup = ({ isOpen, onClose }: FeedbackPopupProps) => {
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback.trim()) return;

        setIsSubmitting(true);

        try {
            const response = await fetch("https://formspree.io/f/xzznggbp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: feedback })
            });

            if (response.ok) {
                setIsSubmitting(false);
                setIsSent(true);
                setFeedback("");

                // Reset after showing success message
                setTimeout(() => {
                    setIsSent(false);
                    onClose();
                }, 2000);
            } else {
                console.error("Failed to send feedback");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Error sending feedback:", error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                        <MessageSquare className="w-8 h-8 text-blue-500 fill-blue-500 animate-pulse" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-neutral-900">Your Feedback Matters</h2>
                        <p className="text-neutral-600 font-medium">
                            Help me improve this platform. What's on your mind?
                        </p>
                    </div>

                    {!isSent ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Share your thoughts, suggestions, or bugs..."
                                className="w-full h-32 p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-neutral-900 placeholder:text-neutral-400"
                                required
                            />
                            <Button
                                type="submit"
                                disabled={isSubmitting || !feedback.trim()}
                                className="w-full h-12 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 text-lg font-bold flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    "Sending..."
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send Feedback
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-green-800 font-bold animate-in fade-in slide-in-from-bottom-4">
                            Thank you! Your feedback has been sent.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackPopup;
