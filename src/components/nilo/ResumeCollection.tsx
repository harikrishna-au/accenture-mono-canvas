import { useState, useRef } from "react";
import { FileText, Loader2, Play, Upload, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { extractTextFromPDF } from "@/utils/pdfUtils";
import { toast } from "sonner";

interface ResumeCollectionProps {
    onSubmit: (resumeText: string) => Promise<void>;
    onUpload: (file: File) => Promise<void>;
    isSubmitting: boolean;
}

export const ResumeCollection = ({ onSubmit, onUpload, isSubmitting }: ResumeCollectionProps) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [resumeText, setResumeText] = useState("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setResumeFile(file);

            // Auto-upload logic could go here, but let's make it manual click for clarity
        }
    };

    const handleUploadDefault = async () => {
        if (!resumeFile) return;

        setIsUploading(true);
        try {
            await onUpload(resumeFile);
            toast.success("Resume uploaded successfully!");

            // Try to extract text for convenience
            try {
                const text = await extractTextFromPDF(resumeFile);
                if (text) setResumeText(text.slice(0, 5000));
            } catch (ignored) {
                // Ignore extraction error, user can paste
            }

            setStep(2);
        } catch (error) {
            toast.error("Failed to upload resume. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleStartInterview = () => {
        if (resumeText.trim()) {
            onSubmit(resumeText);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-6 bg-neutral-50/50">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-neutral-200 p-8 md:p-10 space-y-8 relative overflow-hidden">

                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", step >= 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500")}>1</div>
                    <div className={cn("h-1 w-16 rounded-full", step >= 2 ? "bg-indigo-600" : "bg-gray-200")} />
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", step >= 2 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500")}>2</div>
                </div>

                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        {step === 1 ? <Upload className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {step === 1 ? "Upload Your Resume" : "Review & Paste Content"}
                    </h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        {step === 1
                            ? "First, upload your PDF resume for our records."
                            : "Now, paste the text content below for Devi to analyze."}
                    </p>
                </div>

                {step === 1 && (
                    <div className="space-y-6">
                        <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
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
                                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                    <p className="font-medium text-gray-700">Click to Upload PDF</p>
                                    <p className="text-xs text-gray-500 mt-1">Maximum size: 10MB</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleUploadDefault}
                            disabled={!resumeFile || isUploading}
                            className={cn(
                                "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg transform active:scale-[0.98]",
                                !resumeFile || isUploading
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-black text-white hover:bg-gray-800"
                            )}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    Next Step
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="relative">
                            <textarea
                                value={resumeText}
                                onChange={(e) => {
                                    const text = e.target.value;
                                    if (text.length <= 5000) {
                                        setResumeText(text);
                                    }
                                }}
                                maxLength={5000}
                                placeholder="Paste your resume content here..."
                                className="w-full h-64 p-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none transition-all text-sm font-mono leading-relaxed bg-gray-50/50"
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-medium bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                                {resumeText.length}/5000 chars
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-4 rounded-xl font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all border border-transparent"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleStartInterview}
                                disabled={!resumeText.trim() || isSubmitting}
                                className={cn(
                                    "flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg transform active:scale-[0.98]",
                                    !resumeText.trim() || isSubmitting
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 hover:shadow-indigo-500/25"
                                )}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Preparing Interview...
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
                )}

            </div>
        </div>
    );
};
