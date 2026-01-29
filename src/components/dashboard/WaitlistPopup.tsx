import { useState } from 'react';
import { X, Mail, Loader2, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface WaitlistPopupProps {
    isOpen: boolean;
    onClose: () => void;
    companyName: string;
    companyId: string;
}

export const WaitlistPopup = ({ isOpen, onClose, companyName, companyId }: WaitlistPopupProps) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsLoading(true);

        try {
            // Direct insertion based on user request "make another table in supabase"
            // Assuming table 'waitlist' exists with company_id and email
            const { error } = await supabase
                .from('waitlist' as any)
                .insert([
                    { email: email, company_id: companyId }
                ]);

            if (error) throw error;

            setIsSuccess(true);
            toast.success("You're on the list!");

            // Auto close after success animation
            setTimeout(() => {
                handleClose();
            }, 2500);

        } catch (error) {
            console.error('Error joining waitlist:', error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        // Reset state after transition
        setTimeout(() => {
            setIsSuccess(false);
            setEmail('');
        }, 300);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-[#fafaf9] border-stone-200">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <DialogTitle className="text-xl font-serif text-stone-800">
                            {isSuccess ? "You're in!" : `Join the ${companyName} Waitlist`}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="py-2">
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in duration-500">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <PartyPopper className="w-8 h-8" />
                            </div>
                            <p className="text-center text-stone-600 font-light">
                                We'll notify <strong>{email}</strong> as soon as {companyName} journey is live.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <p className="text-stone-500 text-sm font-light leading-relaxed">
                                Be the first to know when we launch our curated preparation journey for {companyName}.
                            </p>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all placeholder:text-stone-300 text-stone-700"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-6 py-2 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isLoading ? "Joining..." : "Notify Me"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
