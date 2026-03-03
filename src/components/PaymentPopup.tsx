import { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRazorpay } from "@/hooks/useRazorpay";

interface PaymentPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const BASE_PRICE = 120;

async function validateCouponServer(code: string): Promise<number | null> {
    try {
        const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-coupon`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                },
                body: JSON.stringify({ coupon_code: code }),
            }
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data.valid ? data.amount : null;
    } catch {
        return null;
    }
}

const PaymentPopup = ({ isOpen, onClose }: PaymentPopupProps) => {
    const [coupon, setCoupon]               = useState("");
    const [appliedAmount, setAppliedAmount] = useState<number | null>(null);
    const [validating, setValidating]       = useState(false);
    const [error, setError]                 = useState("");
    const { initiatePayment, isLoading }    = useRazorpay();

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

    if (!isOpen) return null;

    const finalAmount = appliedAmount ?? BASE_PRICE;

    const handleApplyCoupon = async () => {
        const code = coupon.trim();
        if (!code) return;
        setValidating(true);
        setError("");
        const amount = await validateCouponServer(code);
        setValidating(false);
        if (amount !== null) {
            setAppliedAmount(amount);
            setError("");
            toast.success("Coupon applied!");
        } else {
            setError("Invalid coupon code");
            setAppliedAmount(null);
        }
    };

    const handlePayment = async () => {
        const success = await initiatePayment(finalAmount);
        if (success) onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-6">
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-neutral-900">Unlock Premium</h2>
                    <p className="text-neutral-500">Get unlimited access to all practice rounds.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between text-lg font-medium p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                        <span>Total Amount</span>
                        <div className="flex flex-col items-end">
                            {appliedAmount ? (
                                <>
                                    <span className="text-neutral-400 line-through text-sm">₹{BASE_PRICE}</span>
                                    <span className="text-2xl font-bold text-green-600">₹{finalAmount}</span>
                                </>
                            ) : (
                                <span className="text-2xl font-bold text-neutral-900">₹{BASE_PRICE}</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">Have a coupon?</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter Code"
                                value={coupon}
                                onChange={(e) => { setCoupon(e.target.value); setError(""); }}
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
                        {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
                        {appliedAmount && (
                            <p className="text-green-600 text-xs font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" /> Coupon applied — you save ₹{BASE_PRICE - appliedAmount}!
                            </p>
                        )}
                    </div>

                    <Button
                        onClick={handlePayment}
                        disabled={isLoading}
                        className="w-full h-12 text-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20"
                    >
                        {isLoading ? "Processing..." : `Pay ₹${finalAmount} & Unlock`}
                    </Button>

                    <p className="text-xs text-center text-neutral-400">
                        Secure payment powered by Razorpay
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentPopup;
