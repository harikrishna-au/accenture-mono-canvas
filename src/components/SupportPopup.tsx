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

    const handlePayU = async () => {
        if (!user) {
            toast.error("Please sign in to proceed");
            return;
        }

        try {
            setIsLoading(true);
            const { data, error } = await supabase.functions.invoke('create-payment', {
                body: {
                    amount: 499, // Example amount
                    productinfo: "Premium Upgrade",
                    firstname: user.firstName || "User",
                    email: user.primaryEmailAddress?.emailAddress,
                    phone: "9999999999", // PayU requires phone, maybe collect or dummy
                    clerk_user_id: user.id
                }
            });

            if (error) throw error;

            // PayU requires a POST form submission
            const form = document.createElement("form");
            form.method = "POST";
            form.action = data.action;

            const fields = {
                key: data.key,
                txnid: data.txnid,
                amount: data.amount,
                productinfo: data.productinfo,
                firstname: data.firstname,
                email: data.email,
                phone: data.phone,
                surl: data.surl,
                furl: data.furl,
                hash: data.hash,
                udf1: data.udf1
            };

            for (const key in fields) {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = fields[key as keyof typeof fields];
                form.appendChild(input);
            }

            document.body.appendChild(form);
            form.submit();

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
                            href="https://buymeachai.ezee.li/harrytheblaze"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-yellow-400 text-yellow-900 rounded-xl font-bold hover:bg-yellow-500 transition-colors"
                        >
                            <Coffee className="w-5 h-5" />
                            Buy me a chai
                        </a>

                        <button
                            onClick={handlePayU}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-[#1065b7] text-white rounded-xl font-bold hover:bg-[#0e5a9c] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <span className="text-xs uppercase tracking-wider">Pay Now via PayU</span>
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
