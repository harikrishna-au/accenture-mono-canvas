
import { useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRazorpay } from "@/hooks/useRazorpay";

interface PaymentPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

// Simple hash function for basic obfuscation
const simpleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
};

// Hashed Coupon Codes (Obfuscated)
const COUPONS: Record<string, number> = {
    "1406405223": 49, // EARLYACCESS (Discounts to 49)
};

const PaymentPopup = ({ isOpen, onClose }: PaymentPopupProps) => {
    const [coupon, setCoupon] = useState("");
    const [appliedAmount, setAppliedAmount] = useState<number | null>(null);
    const [error, setError] = useState("");
    const { initiatePayment, isLoading } = useRazorpay();

    if (!isOpen) return null;

    const displayPrice = 120; // shown crossed out
    const originalAmount = 69; // effective base price
    const finalAmount = appliedAmount ?? originalAmount;

    const handleApplyCoupon = () => {
        const code = coupon.trim().toUpperCase();
        const hashedCode = simpleHash(code);

        if (COUPONS[hashedCode]) {
            setAppliedAmount(COUPONS[hashedCode]);
            setError("");
            toast.success(`Coupon applied!`);
        } else {
            setError("Invalid coupon code");
            setAppliedAmount(null);
        }
    };

    const handlePayment = async () => {
        await initiatePayment(finalAmount);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-6">
                <button
                    onClick={onClose}
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
                                    <span className="text-neutral-400 line-through text-xs">₹{displayPrice}</span>
                                    <span className="text-neutral-400 line-through text-sm">₹{originalAmount}</span>
                                    <span className="text-2xl font-bold text-green-600">₹{finalAmount}</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-neutral-400 line-through text-sm">₹{displayPrice}</span>
                                    <span className="text-2xl font-bold text-neutral-900">₹{originalAmount}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">Have a coupon?</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter Code"
                                value={coupon}
                                onChange={(e) => setCoupon(e.target.value)}
                                className="uppercase"
                            />
                            <Button onClick={handleApplyCoupon} variant="outline" className="shrink-0">
                                Apply
                            </Button>
                        </div>
                        {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
                        {appliedAmount && <p className="text-green-600 text-xs font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Coupon applied successfully!</p>}
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
