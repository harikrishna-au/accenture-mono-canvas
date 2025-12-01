import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Coffee } from "lucide-react";
import qrCode from "@/lib/qr-code.png";

const CompletionPopup = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkCompletion = () => {
            const matrix = localStorage.getItem("completed_matrix");
            const maze = localStorage.getItem("completed_maze");
            const balloon = localStorage.getItem("completed_balloon");

            if (matrix && maze && balloon) {
                // Check if we've already shown it this session to avoid annoyance? 
                // Or just show it. User said "when a user completes all 3 games show a pop up".
                // Let's show it if it hasn't been dismissed yet, or maybe just show it.
                // For now, let's just show it.
                setIsOpen(true);
            }
        };

        // Check on mount
        checkCompletion();

        // Listen for storage events in case a game was just finished in another tab (unlikely but good practice)
        window.addEventListener("storage", checkCompletion);
        return () => window.removeEventListener("storage", checkCompletion);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative animate-in fade-in zoom-in duration-300">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                        <Coffee className="w-8 h-8 text-yellow-600" />
                    </div>

                    <h2 className="text-3xl font-black text-neutral-900">Amazing Job!</h2>
                    <p className="text-lg text-neutral-600">
                        You've successfully completed all 3 assessment games. You're ready to crush it!
                    </p>

                    <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                        <p className="text-sm font-medium text-neutral-500 mb-4">Support my work</p>
                        <img
                            src={qrCode}
                            alt="Buy Me A Coffee QR"
                            className="w-48 h-48 mx-auto rounded-xl shadow-sm mb-4"
                        />
                        <a
                            href="https://buymeacoffee.com/harrytheblaze"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-yellow-600 font-bold hover:underline"
                        >
                            <Coffee className="w-4 h-4" />
                            buymeacoffee.com/harrytheblaze
                        </a>
                    </div>

                    <Button
                        onClick={() => setIsOpen(false)}
                        className="w-full h-12 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CompletionPopup;
