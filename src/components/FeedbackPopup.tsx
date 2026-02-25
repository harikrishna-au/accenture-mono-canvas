import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, MessageSquare, Send, GraduationCap, HeartHandshake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";

export type FeedbackType = 'recruitment' | 'platform';

interface FeedbackPopupProps {
    isOpen: boolean;
    onClose: () => void;
    feedbackType?: FeedbackType;
}

const FeedbackPopup = ({ isOpen, onClose, feedbackType = 'recruitment' }: FeedbackPopupProps) => {
    const { user } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [showCampusConfirmation, setShowCampusConfirmation] = useState(true);

    // Form Stats
    const [name, setName] = useState("");
    const [college, setCollege] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [graduatingYear, setGraduatingYear] = useState("");
    const [placementType, setPlacementType] = useState("");
    const [techRoundExp, setTechRoundExp] = useState("");

    // Platform specific
    const [platformFeedback, setPlatformFeedback] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (feedbackType === 'recruitment') {
            if (!name.trim() || !college.trim()) {
                toast.error("Please fill in your name and college.");
                return;
            }

            if (!placementType) {
                toast.error("Please select your placement type.");
                return;
            }
        } else {
            if (!platformFeedback.trim()) {
                toast.error("Please provide some feedback.");
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase.from('feedback').insert({
                user_id: user?.id || null,
                name: name || (user?.fullName || 'Anonymous'), // Use simple name for platform feedback if not provided
                // Only include recruitment fields if type is recruitment
                college: feedbackType === 'recruitment' ? college : null,
                mobile_number: feedbackType === 'recruitment' ? mobileNumber : null,
                graduating_year: feedbackType === 'recruitment' ? graduatingYear : null,
                placement_type: feedbackType === 'recruitment' ? placementType : 'Platform Feedback',
                technical_round_exp: feedbackType === 'recruitment' ? techRoundExp : platformFeedback // Reusing this field or create new one? reuse for now as it's text
            } as any);

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
                    {/* Recruitment Flow - Campus Check */}
                    {feedbackType === 'recruitment' && showCampusConfirmation ? (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                                <GraduationCap className="w-9 h-9 text-blue-600" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-2xl font-black text-neutral-900 leading-tight">Important for On-Campus Students</h2>
                                <p className="text-neutral-600 text-sm leading-relaxed">
                                    If an MNC is visiting your college for on-campus placements, this is crucial.
                                </p>
                                <p className="text-neutral-600 text-sm leading-relaxed">
                                    Please connect with us and fill the feedback form. Your input helps us bring this game-based practice directly to your campus before the real assessment.
                                </p>
                                <p className="text-neutral-500 text-xs italic mt-4">
                                    Thank you for supporting student preparation.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                                <Button
                                    onClick={() => {
                                        setPlacementType("On-Campus");
                                        setShowCampusConfirmation(false);
                                    }}
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-base font-bold shadow-lg shadow-blue-200"
                                >
                                    🔵 Yes, a company is coming to my campus
                                </Button>
                                <Button
                                    onClick={() => {
                                        setPlacementType("Off-Campus"); // Default to off-campus if passed? or just show form
                                        setShowCampusConfirmation(false);
                                    }}
                                    variant="outline"
                                    className="w-full h-12 border-2 border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-base font-medium"
                                >
                                    ⚪ Not sure / Later
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="text-center space-y-2">
                                <div className={`w-14 h-14 ${feedbackType === 'platform' ? 'bg-rose-50' : 'bg-indigo-50'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                                    {feedbackType === 'platform' ? (
                                        <HeartHandshake className="w-7 h-7 text-rose-500 fill-rose-500/20" />
                                    ) : (
                                        <MessageSquare className="w-7 h-7 text-indigo-600 fill-indigo-600/20" />
                                    )}
                                </div>
                                <h2 className="text-2xl font-black text-neutral-900 leading-tight">
                                    {feedbackType === 'platform' ? "We Value Your Thoughts" : "Quick Survey"}
                                </h2>
                                <p className="text-neutral-500 text-sm font-medium">
                                    {feedbackType === 'platform'
                                        ? "Have a suggestion or found a bug? Let us know!"
                                        : "Help us design the Communication Round tailored for you."}
                                </p>
                            </div>

                            {!isSent ? (
                                <form onSubmit={handleSubmit} className="space-y-5">

                                    {feedbackType === 'recruitment' ? (
                                        // RECRUITMENT FORM FIELDS
                                        <>
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
                                                <div className="space-y-1.5">
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
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="gradYear" className="text-xs font-bold text-neutral-500 uppercase">Graduating Year</Label>
                                                    <Input
                                                        id="gradYear"
                                                        placeholder="e.g., 2024"
                                                        type="text"
                                                        value={graduatingYear}
                                                        onChange={(e) => setGraduatingYear(e.target.value)}
                                                        className="h-11 bg-neutral-50 border-neutral-200"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold text-neutral-800">Placement Type</Label>
                                                <RadioGroup value={placementType} onValueChange={setPlacementType} className="flex gap-4">
                                                    <div className="flex items-center space-x-2 border rounded-xl px-4 py-2 hover:bg-neutral-50 cursor-pointer w-full">
                                                        <RadioGroupItem value="On-Campus" id="p1" />
                                                        <Label htmlFor="p1" className="cursor-pointer font-medium">On-Campus</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2 border rounded-xl px-4 py-2 hover:bg-neutral-50 cursor-pointer w-full">
                                                        <RadioGroupItem value="Off-Campus" id="p2" />
                                                        <Label htmlFor="p2" className="cursor-pointer font-medium">Off-Campus</Label>
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
                                        </>
                                    ) : (
                                        // PLATFORM FEEDBACK FORM FIELDS
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="platform-msg" className="text-xs font-bold text-neutral-500 uppercase">Your Message</Label>
                                                <Textarea
                                                    id="platform-msg"
                                                    placeholder="Tell us what you like or what we can improve..."
                                                    className="min-h-[120px] bg-neutral-50 border-neutral-200 resize-none"
                                                    value={platformFeedback}
                                                    onChange={(e) => setPlatformFeedback(e.target.value)}
                                                />
                                            </div>
                                            {/* Optional Name for platform - mostly anon is fine but good to have */}
                                            {/* <div className="space-y-1.5">
                                                    <Label htmlFor="p-name" className="text-xs font-bold text-neutral-500 uppercase">Name (Optional)</Label>
                                                    <Input
                                                        id="p-name"
                                                        placeholder="Your Name"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="h-10 bg-neutral-50 border-neutral-200"
                                                    />
                                              </div> */}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full h-12 text-white rounded-xl text-lg font-bold flex items-center justify-center gap-2 shadow-lg mt-2 ${feedbackType === 'platform'
                                                ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200"
                                                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                                            }`}
                                    >
                                        {isSubmitting ? "Submitting..." : (
                                            <>
                                                Submit Feedback <Send className="w-4 h-4 ml-1" />
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackPopup;
