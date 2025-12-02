import { Button } from "@/components/ui/button";
import { X, Coffee, Heart } from "lucide-react";
import qrCode from "@/lib/qr-code.png";

interface SupportPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const SupportPopup = ({ isOpen, onClose }: SupportPopupProps) => {
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
