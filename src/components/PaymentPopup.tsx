import { useState, useEffect } from "react";
import { X, Check, Loader2, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRazorpay } from "@/hooks/useRazorpay";
import { supabase } from "@/integrations/supabase/client";

interface PaymentPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const LIFETIME_PRICE = 999;
const MONTHLY_PRICE  = 149;

async function validateCouponServer(code: string): Promise<number | null> {
    try {
        const { data, error } = await supabase.functions.invoke('validate-coupon', {
            body: { coupon_code: code },
        });
        if (error) return null;
        return data?.valid ? data.amount : null;
    } catch {
        return null;
    }
}

type Plan = 'monthly' | 'lifetime';

const PaymentPopup = ({ isOpen, onClose }: PaymentPopupProps) => {
    const [plan, setPlan]                   = useState<Plan>('monthly');
    const [coupon, setCoupon]               = useState("");
    const [appliedAmount, setAppliedAmount] = useState<number | null>(null);
    const [validating, setValidating]       = useState(false);
    const [couponError, setCouponError]     = useState("");
    const { initiatePayment, initiateSubscription, isLoading } = useRazorpay();

    // Auto-apply referral coupon from localStorage (only for lifetime plan)
    useEffect(() => {
        if (!isOpen || appliedAmount) return;
        const stored = localStorage.getItem("referral_coupon");
        if (!stored) return;
        setCoupon(stored);
        validateCouponServer(stored).then((amount) => {
            if (amount !== null) {
                setAppliedAmount(amount);
                setPlan('lifetime');
                toast.success("Referral coupon applied!");
            }
        });
    }, [isOpen]);

    if (!isOpen) return null;

    const finalAmount = plan === 'lifetime' ? (appliedAmount ?? LIFETIME_PRICE) : MONTHLY_PRICE;

    const handleApplyCoupon = async () => {
        const code = coupon.trim();
        if (!code) return;
        setValidating(true);
        setCouponError("");
        const amount = await validateCouponServer(code);
        setValidating(false);
        if (amount !== null) {
            setAppliedAmount(amount);
            setCouponError("");
            toast.success("Coupon applied!");
        } else {
            setCouponError("Invalid coupon code");
            setAppliedAmount(null);
        }
    };

    const handlePayment = async () => {
        let success: boolean | undefined;
        if (plan === 'monthly') {
            success = await initiateSubscription();
        } else {
            success = await initiatePayment(finalAmount, coupon.trim() || undefined);
        }
        if (success) onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-5">
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center space-y-1">
                    <h2 className="text-2xl font-bold text-neutral-900">Unlock Premium</h2>
                    <p className="text-neutral-500 text-sm">Choose the plan that works for you.</p>
                </div>

                {/* Plan selector */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => { setPlan('monthly'); setAppliedAmount(null); }}
                        className={`relative flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all ${
                            plan === 'monthly'
                                ? 'border-amber-500 bg-amber-50'
                                : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'
                        }`}
                    >
                        <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                            <RefreshCw className="w-4 h-4" />
                            Monthly
                        </div>
                        <p className="text-2xl font-bold text-neutral-900">
                            ₹{MONTHLY_PRICE}
                            <span className="text-sm font-normal text-neutral-400">/mo</span>
                        </p>
                        <p className="text-xs text-neutral-500">Cancel anytime</p>
                        {plan === 'monthly' && (
                            <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500">
                                <Check className="w-3 h-3 text-white" />
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setPlan('lifetime')}
                        className={`relative flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all ${
                            plan === 'lifetime'
                                ? 'border-amber-500 bg-amber-50'
                                : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'
                        }`}
                    >
                        <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                            <Zap className="w-4 h-4" />
                            One-time
                        </div>
                        <p className="text-2xl font-bold text-neutral-900">₹{LIFETIME_PRICE}</p>
                        <p className="text-xs text-neutral-500">Lifetime access</p>
                        <span className="absolute -top-2 right-3 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            BEST VALUE
                        </span>
                        {plan === 'lifetime' && (
                            <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500">
                                <Check className="w-3 h-3 text-white" />
                            </span>
                        )}
                    </button>
                </div>

                {/* What's included */}
                <ul className="space-y-1.5 text-sm text-neutral-600">
                    {[
                        "Unlimited practice rounds",
                        "All communication patterns",
                        "Premium interview prep",
                    ].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500 shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>

                {/* Coupon — only for lifetime plan */}
                {plan === 'lifetime' && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">Have a coupon?</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter Code"
                                value={coupon}
                                onChange={(e) => { setCoupon(e.target.value); setCouponError(""); }}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApplyCoupon(); } }}
                                className="uppercase"
                            />
                            <Button
                                onClick={handleApplyCoupon}
                                disabled={validating || !coupon.trim()}
                                variant="outline"
                                className="shrink-0 min-w-[72px]"
                            >
                                {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                            </Button>
                        </div>
                        {couponError && <p className="text-red-500 text-xs font-medium">{couponError}</p>}
                        {appliedAmount && (
                            <p className="text-green-600 text-xs font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" /> Coupon applied — you save ₹{LIFETIME_PRICE - appliedAmount}!
                            </p>
                        )}
                    </div>
                )}

                <Button
                    onClick={handlePayment}
                    disabled={isLoading}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20"
                >
                    {isLoading
                        ? "Processing..."
                        : plan === 'monthly'
                            ? `Subscribe for ₹${MONTHLY_PRICE}/month`
                            : `Pay ₹${finalAmount} — Lifetime Access`
                    }
                </Button>

                <p className="text-xs text-center text-neutral-400">
                    Secure payment powered by Razorpay
                </p>
            </div>
        </div>
    );
};

export default PaymentPopup;
