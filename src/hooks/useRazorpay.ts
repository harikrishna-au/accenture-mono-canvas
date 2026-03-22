
import { useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";

export function useRazorpay() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if ((window as any).Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    /** One-time payment (₹999 lifetime plan). */
    const initiatePayment = async (amount: number = 999, couponCode?: string) => {
        if (!user) {
            toast.error("Please sign in to proceed");
            return false;
        }

        const res = await loadRazorpayScript();
        if (!res) {
            toast.error("Razorpay SDK failed to load. Are you online?");
            return false;
        }

        try {
            setIsLoading(true);

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-razorpay-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                },
                body: JSON.stringify({ amount, clerk_user_id: user.id })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create order');
            }

            const order = await response.json();

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount.toString(),
                currency: order.currency,
                name: "Harry The Blaze",
                description: "Lifetime Premium",
                order_id: order.id,
                handler: async function (response: any) {
                    try {
                        const clerkToken = await getToken();
                        const verifyRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-razorpay-payment`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${clerkToken}`,
                            },
                            body: JSON.stringify({
                                order_id: response.razorpay_order_id,
                                payment_id: response.razorpay_payment_id,
                                signature: response.razorpay_signature,
                                coupon_code: couponCode,
                            })
                        });

                        if (verifyRes.ok) {
                            toast.success("Payment verified! Lifetime premium unlocked.");
                            localStorage.removeItem("referral_coupon");
                            try { await user.reload(); } catch { window.location.reload(); }
                        } else {
                            toast.error("Payment successful but verification failed. Contact support.");
                            try { await user.reload(); } catch { window.location.reload(); }
                        }
                    } catch (e) {
                        console.error("Verification error", e);
                        try { await user.reload(); } catch { window.location.reload(); }
                    }
                },
                prefill: {
                    name: user.fullName || "",
                    email: user.primaryEmailAddress?.emailAddress || "",
                },
                theme: { color: "#3399cc" }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', (resp: any) => {
                toast.error(`Payment failed: ${resp.error?.description}`);
            });
            rzp.open();
            return true;

        } catch (error: any) {
            console.error('Payment Error:', error);
            toast.error(error.message || "Failed to initiate payment");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    /** Monthly recurring subscription (₹149/month). */
    const initiateSubscription = async () => {
        if (!user) {
            toast.error("Please sign in to proceed");
            return false;
        }

        const res = await loadRazorpayScript();
        if (!res) {
            toast.error("Razorpay SDK failed to load. Are you online?");
            return false;
        }

        try {
            setIsLoading(true);
            const clerkToken = await getToken();

            // Create subscription via edge function
            const subRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-razorpay-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${clerkToken}`,
                },
                body: JSON.stringify({}),
            });

            if (!subRes.ok) {
                const err = await subRes.json();
                throw new Error(err.error || 'Failed to create subscription');
            }

            const { subscription_id } = await subRes.json();

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                subscription_id,
                name: "Harry The Blaze",
                description: "Monthly Premium — ₹149/month",
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-subscription-payment`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${clerkToken}`,
                            },
                            body: JSON.stringify({
                                payment_id: response.razorpay_payment_id,
                                subscription_id: response.razorpay_subscription_id,
                                signature: response.razorpay_signature,
                            }),
                        });

                        if (verifyRes.ok) {
                            toast.success("Subscribed! Monthly premium is now active.");
                            try { await user.reload(); } catch { window.location.reload(); }
                        } else {
                            toast.error("Payment successful but verification failed. Contact support.");
                            try { await user.reload(); } catch { window.location.reload(); }
                        }
                    } catch (e) {
                        console.error("Subscription verification error", e);
                        try { await user.reload(); } catch { window.location.reload(); }
                    }
                },
                prefill: {
                    name: user.fullName || "",
                    email: user.primaryEmailAddress?.emailAddress || "",
                },
                theme: { color: "#3399cc" }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', (resp: any) => {
                toast.error(`Payment failed: ${resp.error?.description}`);
            });
            rzp.open();
            return true;

        } catch (error: any) {
            console.error('Subscription Error:', error);
            toast.error(error.message || "Failed to initiate subscription");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { initiatePayment, initiateSubscription, isLoading };
}
