
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useRazorpay() {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if ((window as any).Razorpay) {
                resolve(true); // Already loaded
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const initiatePayment = async () => {
        if (!user) {
            toast.error("Please sign in to proceed");
            return;
        }

        const res = await loadRazorpayScript();
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
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Accenture Mono Canvas",
                description: "Premium Upgrade",
                order_id: order.id,
                handler: async function (response: any) {
                    toast.success("Payment Successful! Upgrading your account...");
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

    return { initiatePayment, isLoading };
}
