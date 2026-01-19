import { useState, useRef } from "react";
import { FileText, Loader2, Play, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { extractTextFromPDF } from "@/utils/pdfUtils";
import { toast } from "sonner";

interface ResumeCollectionProps {
    onSubmit: (resume: string | File) => Promise<void>;
    isSubmitting: boolean;
}

export const ResumeCollection = ({ onSubmit, isSubmitting }: ResumeCollectionProps) => {
    const [resumeText, setResumeText] = useState("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [tab, setTab] = useState<"text" | "pdf">("text"); // 'text' or 'pdf'
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleStart = async () => {
        if (tab === "text" && resumeText.trim()) {
            onSubmit(resumeText);
        } else if (tab === "pdf" && resumeFile) {
            try {
                setIsExtracting(true);
                const text = await extractTextFromPDF(resumeFile);
                if (!text.trim()) {
                    toast.error("Could not read text from this PDF. Please try copying and pasting instead.");
                    return;
                }
                await onSubmit(text);
            } catch (error) {
                toast.error("Failed to read PDF file.");
            } finally {
                setIsExtracting(false);
            }
        }
    };

    const isReady = (tab === "text" && !!resumeText.trim()) || (tab === "pdf" && !!resumeFile);

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-6 bg-neutral-50/50">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-neutral-200 p-8 md:p-10 space-y-8">
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Let's Get Started</h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Upload your resume (PDF) or paste the text directly. Sarah, our AI recruiter, will analyze it to tailor the interview.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button
                        onClick={() => setTab("text")}
                        className={cn(
                            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                            tab === "text" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Paste Text
                    </button>
                    <button
                        onClick={() => setTab("pdf")}
                        className={cn(
                            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                            tab === "pdf" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Upload PDF
                    </button>
                </div>

                <div className="space-y-4">
                    {tab === "text" ? (
                        <div className="relative">
                            <textarea
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                placeholder="Paste your resume content here..."
                                className="w-full h-64 p-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none transition-all text-sm font-mono leading-relaxed bg-gray-50/50"
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-medium bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                                {resumeText.length} chars
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}>

                            <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />

                            {resumeFile ? (
                                <div className="text-center p-4">
                                    <FileText className="w-12 h-12 text-indigo-600 mx-auto mb-2" />
                                    <p className="font-medium text-gray-900">{resumeFile.name}</p>
                                    <p className="text-sm text-gray-500">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                                        className="mt-4 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium hover:bg-red-200"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center p-4">
                                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                    <p className="font-medium text-gray-700">Click to Upload PDF</p>
                                    <p className="text-xs text-gray-500 mt-1">Maximum size: 5MB</p>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleStart}
                        disabled={!isReady || isSubmitting || isExtracting}
                        className={cn(
                            "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg transform active:scale-[0.98]",
                            !isReady || isSubmitting || isExtracting
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 hover:shadow-indigo-500/25"
                        )}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Preparing Interview...
                            </>
                        ) : isExtracting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Reading PDF...
                            </>
                        ) : (
                            <>
                                Start Interview
                                <Play className="w-5 h-5 fill-current" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
