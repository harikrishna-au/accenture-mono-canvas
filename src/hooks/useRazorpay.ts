
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
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-razorpay-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                },
                body: JSON.stringify({
                    amount: 9, // Amount in INR
                    clerk_user_id: user.id
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create order');
            }

            const order = await response.json();

            // 2. Open Razorpay Options
            const options = {
                "key": import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
                "amount": order.amount.toString(), // Amount is in currency subunits.
                "currency": order.currency,
                "name": "Harry The Blaze", // your business name
                "description": "Premium Subscription",
                "image": "https://avatars.githubusercontent.com/u/12345678?v=4", // Use a valid logo URL or placeholder
                "order_id": order.id, // This is a sample Order ID. Pass the `id` obtained in the response of Step 1
                // "callback_url": "https://eneqd3r9zrjok.x.pipedream.net/", // We use handler instead for SPA
                "handler": async function (response: any) {
                    toast.success("Payment Successful! Welcome to Premium.");
                    // In a real app, verify signature here by calling backend
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                },
                "prefill": {
                    "name": user.fullName || "", // your customer's name
                    "email": user.primaryEmailAddress?.emailAddress || "",
                    "contact": "" // Provide the customer's phone number for better conversion rates 
                },
                "notes": {
                    "address": "Accenture Mono Canvas Office"
                },
                "theme": {
                    "color": "#3399cc" // Matching the requested snippet color
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
