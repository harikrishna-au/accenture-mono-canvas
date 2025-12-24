import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";

interface FeedbackPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const FeedbackPopup = ({ isOpen, onClose }: FeedbackPopupProps) => {
    const { user } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    // Form Stats
    const [name, setName] = useState("");
    const [college, setCollege] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [selectedRound, setSelectedRound] = useState("Not Sure");
    const [rating, setRating] = useState(5);
    const [techRoundExp, setTechRoundExp] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !college.trim()) {
            toast.error("Please fill in your name and college.");
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase.from('feedback').insert({
                user_id: user?.id || null, // Capture auth user if available
                name: name,
                college: college,
                mobile_number: mobileNumber,
                selected_round: selectedRound,
                rating: rating,
                technical_round_exp: techRoundExp
            });

            if (error) throw error;

            setIsSubmitting(false);
            setIsSent(true);
            toast.success("Feedback Received! Thank you.");

            // Reset after showing success message
            setTimeout(() => {
                setIsSent(false);
                onClose();
            }, 2500);

        } catch (error: any) {
            console.error("Error sending feedback:", error);
            toast.error("Failed to send feedback. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-lg w-full relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors bg-neutral-100 p-2 rounded-full"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MessageSquare className="w-7 h-7 text-indigo-600 fill-indigo-600/20" />
                        </div>
                        <h2 className="text-2xl font-black text-neutral-900 leading-tight">Quick Survey</h2>
                        <p className="text-neutral-500 text-sm font-medium">
                            Help us design the Communication Round tailored for you.
                        </p>
                    </div>

                    {!isSent ? (
                        <form onSubmit={handleSubmit} className="space-y-5">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-xs font-bold text-neutral-500 uppercase">Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Your Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-11 bg-neutral-50 border-neutral-200"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="college" className="text-xs font-bold text-neutral-500 uppercase">College</Label>
                                    <Input
                                        id="college"
                                        placeholder="College Name"
                                        value={college}
                                        onChange={(e) => setCollege(e.target.value)}
                                        className="h-11 bg-neutral-50 border-neutral-200"
                                    />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="mobile" className="text-xs font-bold text-neutral-500 uppercase">Mobile Number</Label>
                                    <Input
                                        id="mobile"
                                        placeholder="Your Mobile Number"
                                        type="tel"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                        className="h-11 bg-neutral-50 border-neutral-200"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-neutral-800">Did you clear selected for Communication Round?</Label>
                                <RadioGroup defaultValue="Not Sure" value={selectedRound} onValueChange={setSelectedRound} className="flex gap-4">
                                    <div className="flex items-center space-x-2 border rounded-xl px-4 py-2 hover:bg-neutral-50 cursor-pointer w-full">
                                        <RadioGroupItem value="Yes" id="r1" />
                                        <Label htmlFor="r1" className="cursor-pointer font-medium">Yes</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border rounded-xl px-4 py-2 hover:bg-neutral-50 cursor-pointer w-full">
                                        <RadioGroupItem value="No" id="r2" />
                                        <Label htmlFor="r2" className="cursor-pointer font-medium">No</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border rounded-xl px-4 py-2 hover:bg-neutral-50 cursor-pointer w-full">
                                        <RadioGroupItem value="Not Sure" id="r3" />
                                        <Label htmlFor="r3" className="cursor-pointer font-medium">Not Sure</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-neutral-800">How was your Technical Round?</Label>
                                <Textarea
                                    placeholder="Briefly describe your experience..."
                                    className="min-h-[80px] bg-neutral-50 border-neutral-200 resize-none"
                                    value={techRoundExp}
                                    onChange={(e) => setTechRoundExp(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-neutral-800">Rate this Application</Label>
                                <div className="flex gap-2 justify-center py-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`text-3xl transition-transform hover:scale-110 focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-neutral-200'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 mt-2"
                            >
                                {isSubmitting ? "Submitting..." : (
                                    <>
                                        Submit Survey <Send className="w-4 h-4 ml-1" />
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="bg-green-50 p-8 rounded-3xl border border-green-100 text-center space-y-3 animate-in fade-in slide-in-from-bottom-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                <span className="text-3xl">🎉</span>
                            </div>
                            <h3 className="text-xl font-bold text-green-900">Thank You!</h3>
                            <p className="text-green-800 font-medium">
                                Your feedback helps us build better tools for you.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackPopup;
