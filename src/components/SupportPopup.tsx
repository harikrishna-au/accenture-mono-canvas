import { Button } from "@/components/ui/button";
import { X, Coffee, Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SupportPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const SupportPopup = ({ isOpen, onClose }: SupportPopupProps) => {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleRazorpay = async () => {
        if (!user) {
            toast.error("Please sign in to proceed");
            return;
        }

        const res = await loadRazorpay();
        if (!res) {
            toast.error("Razorpay SDK failed to load. Are you online?");
            return;
        }

        try {
            setIsLoading(true);

            // 1. Create Order
            const { data: order, error } = await supabase.functions.invoke('create-razorpay-order', {
                body: {
                    amount: 499, // Amount in INR
                    clerk_user_id: user.id
                }
            });

            if (error) throw error;

            // 2. Open Razorpay Options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Frontend Key ID
                amount: order.amount,
                currency: order.currency,
                name: "Accenture Mono Canvas",
                description: "Premium Upgrade",
                // image: "https://your-logo-url",
                order_id: order.id, // This is the Order ID created in step 1
                handler: async function (response: any) {
                    // Payment Successful!
                    // In a production app, verify signature on backend again just to be sure
                    // But our Webhook will handle the actual DB upgrade safely.
                    toast.success("Payment Successful! Upgrading your account...");

                    // Optimistic update or reload could happen here
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                },
                prefill: {
                    name: user.fullName || "User",
                    email: user.primaryEmailAddress?.emailAddress,
                    contact: "9999999999"
                },
                theme: {
                    color: "#0F172A"
                }
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();

        } catch (error: any) {
            console.error('Payment Error:', error);
            toast.error(error.message || "Failed to initiate payment");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                        <Heart className="w-8 h-8 text-red-500 fill-red-500 animate-pulse" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-neutral-900">Support My Work</h2>
                        <p className="text-neutral-600 font-medium">
                            Your support fuels my journey to build more awesome tools for you!
                        </p>
                    </div>

                    <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 space-y-4">
                        <a
                            href="https://razorpay.me/@nallanaharikrishna"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-yellow-400 text-yellow-900 rounded-xl font-bold hover:bg-yellow-500 transition-colors"
                        >
                            <Coffee className="w-5 h-5" />
                            Buy me a chai
                        </a>

                        <button
                            onClick={handleRazorpay}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-[#3399cc] text-white rounded-xl font-bold hover:bg-[#287aa3] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <span className="text-xs uppercase tracking-wider">Pay Now via Razorpay</span>
                            )}
                        </button>
                    </div>

                    <Button
                        onClick={onClose}
                        className="w-full h-12 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 text-lg font-bold"
                    >
                        Thank You!
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SupportPopup;
