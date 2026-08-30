import { useState, useEffect } from "react";
import { X, Check, Loader2, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRazorpay } from "@/hooks/useRazorpay";
import { supabase } from "@/integrations/supabase/client";

interface PaymentPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const LIST_PRICE = 500;
const BASE_PRICE = 299;

function msUntilMidnight() {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return Math.max(0, end.getTime() - now.getTime());
}

function pad(n: number) {
    return String(n).padStart(2, "0");
}

function splitCountdown(ms: number) {
    const total = Math.floor(ms / 1000);
    return {
        h: pad(Math.floor(total / 3600)),
        m: pad(Math.floor((total % 3600) / 60)),
        s: pad(total % 60),
    };
}

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

const PaymentPopup = ({ isOpen, onClose }: PaymentPopupProps) => {
    const [coupon, setCoupon]               = useState("");
    const [appliedAmount, setAppliedAmount] = useState<number | null>(null);
    const [validating, setValidating]       = useState(false);
    const [couponError, setCouponError]     = useState("");
    const [remainMs, setRemainMs]          = useState(msUntilMidnight);
    const { initiatePayment, isLoading } = useRazorpay();

    // Auto-apply referral coupon from localStorage
    useEffect(() => {
        if (!isOpen || appliedAmount) return;
        const stored = localStorage.getItem("referral_coupon");
        if (!stored) return;
        setCoupon(stored);
        validateCouponServer(stored).then((amount) => {
            if (amount !== null) {
                setAppliedAmount(amount);
                toast.success("Referral coupon applied!");
            }
        });
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        setRemainMs(msUntilMidnight());
        const id = setInterval(() => setRemainMs(msUntilMidnight()), 1000);
        return () => clearInterval(id);
    }, [isOpen]);

    if (!isOpen) return null;

    const finalAmount = appliedAmount ?? BASE_PRICE;
    const { h, m, s } = splitCountdown(remainMs);
    const savings = LIST_PRICE - finalAmount;

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
        const success = await initiatePayment(finalAmount, coupon.trim() || undefined);
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
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full text-amber-700 text-xs font-semibold mb-2">
                        <Zap className="w-3 h-3" />
                        One-time · Full access forever
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900">Unlock Premium</h2>
                    <p className="text-neutral-500 text-sm">Pay once. No subscription. No renewal.</p>
                </div>

                {/* Price display */}
                <div className="rounded-xl border-2 border-amber-500 bg-amber-50 p-5 text-center space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
                        <Clock className="w-3 h-3" />
                        Offer ends in {h}:{m}:{s}
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-neutral-400 text-sm line-through">₹{LIST_PRICE}</p>
                        <p className="text-4xl font-bold text-neutral-900">₹{finalAmount}</p>
                        {savings > 0 && (
                            <p className="text-green-600 text-xs font-semibold">You save ₹{savings}!</p>
                        )}
                    </div>
                    <p className="text-neutral-500 text-xs">One-time payment</p>
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

                {/* Coupon */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Have a coupon?</label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter code"
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
                </div>

                <Button
                    onClick={handlePayment}
                    disabled={isLoading}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20"
                >
                    {isLoading ? "Processing..." : `Pay ₹${finalAmount} — Get Full Access`}
                </Button>

                <p className="text-xs text-center text-neutral-400">
                    Secure payment powered by Razorpay
                </p>
            </div>
        </div>
    );
};

export default PaymentPopup;
