import { X, Send } from "lucide-react";
import { useEffect, useState } from "react";
import OutlineButton from "./OutlineButton";

interface TelegramPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const TelegramPopup = ({ isOpen, onClose }: TelegramPopupProps) => {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
        } else {
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"
                }`}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className={`relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                }`}>
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 rounded-full hover:bg-neutral-100 transition-colors"
                >
                    <X className="w-5 h-5 text-neutral-500" />
                </button>

                <div className="flex flex-col items-center text-center space-y-4 pt-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                        <Send className="w-8 h-8 text-blue-500 ml-1" />
                    </div>

                    <h2 className="text-2xl font-bold text-neutral-900">
                        Join Our Telegram Community!
                    </h2>

                    <p className="text-neutral-600 leading-relaxed">
                        Get exclusive updates, discuss interview strategies, and connect with other aspirants in our official Telegram group.
                    </p>

                    <div className="w-full pt-2">
                        <a href="https://t.me/+fVak9BHY0lgxMTA1" target="_blank" rel="noopener noreferrer" className="w-full block">
                            <OutlineButton onClick={onClose} variant="large" className="w-full">
                                JOIN NOW
                            </OutlineButton>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TelegramPopup;
