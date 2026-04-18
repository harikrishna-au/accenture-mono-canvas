import { useState, useRef, useCallback } from "react";
import { FileText, Loader2, Play, Upload, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { extractTextFromPDF } from "@/utils/pdfUtils";

interface ResumeCollectionProps {
    onSubmit: (resumeText: string) => Promise<void>;
    isSubmitting: boolean;
    interviewType?: "hr" | "technical" | "hackwithinfy";
}

const TYPE_STYLE = {
    technical:    { label: "Technical Interview",        color: "#059669", bg: "rgba(5,150,105,0.07)",   border: "rgba(5,150,105,0.2)"   },
    hr:           { label: "HR Interview",               color: "#e11d48", bg: "rgba(225,29,72,0.07)",   border: "rgba(225,29,72,0.2)"   },
    hackwithinfy: { label: "HackWithInfy Mock",          color: "#007CC3", bg: "rgba(0,124,195,0.07)",   border: "rgba(0,124,195,0.18)"  },
};

export const ResumeCollection = ({
    onSubmit,
    isSubmitting,
    interviewType = "hr",
}: ResumeCollectionProps) => {
    const [resumeText, setResumeText]     = useState("");
    const [isParsing, setIsParsing]       = useState(false);
    const [parseError, setParseError]     = useState<string | null>(null);
    const [fileName, setFileName]         = useState<string | null>(null);
    const [isDragging, setIsDragging]     = useState(false);
    const fileInputRef                    = useRef<HTMLInputElement>(null);

    const style = TYPE_STYLE[interviewType] ?? TYPE_STYLE.hr;

    // ── Core: extract text from File and populate textarea ────────────────────
    const handleFile = useCallback(async (file: File) => {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            setParseError("Please upload a PDF file.");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setParseError("File must be under 10 MB.");
            return;
        }

        setParseError(null);
        setIsParsing(true);
        setFileName(file.name);

        try {
            const text = await extractTextFromPDF(file);
            if (!text.trim()) {
                setParseError("Couldn't extract text from this PDF. Please paste your resume manually.");
                setFileName(null);
            } else {
                // cap at 5000 chars to keep the backend prompt manageable
                setResumeText(text.slice(0, 5000));
            }
        } catch {
            setParseError("Failed to parse PDF. Please paste your resume text manually.");
            setFileName(null);
        } finally {
            setIsParsing(false);
        }
    }, []);

    // ── Drag-and-drop ─────────────────────────────────────────────────────────
    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = ()                     => setIsDragging(false);

    const clearFile = () => {
        setFileName(null);
        setResumeText("");
        setParseError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-6 bg-neutral-50/50">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-neutral-200 p-8 md:p-10 space-y-6 relative overflow-hidden">

                {/* Header */}
                <div className="text-center space-y-3">
                    <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.18em] uppercase font-['Inter'] border"
                        style={{ color: style.color, background: style.bg, borderColor: style.border }}
                    >
                        {style.label}
                    </span>
                    <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                        style={{ background: style.bg, border: `1px solid ${style.border}` }}
                    >
                        <FileText className="w-7 h-7" style={{ color: style.color }} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Add Your Resume</h1>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                        Upload your PDF — text is extracted locally and never stored.
                        Or paste it directly below.
                    </p>
                </div>

                {/* Drop zone */}
                <div
                    className={cn(
                        "relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all p-6",
                        isDragging
                            ? "border-blue-400 bg-blue-50 scale-[1.01]"
                            : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
                    )}
                    style={isDragging ? { borderColor: style.color, background: style.bg } : {}}
                    onClick={() => !fileName && fileInputRef.current?.click()}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                >
                    <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                    />

                    {isParsing ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                            <Loader2 className="w-8 h-8 animate-spin" style={{ color: style.color }} />
                            <p className="text-sm font-medium text-gray-600">Extracting text…</p>
                        </div>
                    ) : fileName ? (
                        <div className="flex items-center gap-3 w-full">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: style.bg }}
                            >
                                <FileText className="w-5 h-5" style={{ color: style.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 text-sm truncate">{fileName}</p>
                                <p className="text-xs text-gray-400">{resumeText.length} characters extracted</p>
                            </div>
                            <button
                                onClick={e => { e.stopPropagation(); clearFile(); }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-gray-400" />
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-700">Drop your PDF here</p>
                                <p className="text-xs text-gray-400 mt-0.5">or click to browse · max 10 MB</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Parse error */}
                {parseError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {parseError}
                    </div>
                )}

                {/* Text area — editable preview or manual paste */}
                <div className="relative">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Resume Text {fileName ? "(extracted — edit if needed)" : "(paste manually)"}
                    </label>
                    <textarea
                        value={resumeText}
                        onChange={e => setResumeText(e.target.value.slice(0, 5000))}
                        placeholder="Your resume text will appear here after upload, or paste it directly…"
                        className="w-full h-52 p-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none text-sm font-mono leading-relaxed bg-gray-50/50 transition-all"
                    />
                    <div className="absolute bottom-3 right-3 text-[10px] font-medium text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100 shadow-sm">
                        {resumeText.length}/5000
                    </div>
                </div>

                {/* Start button */}
                <button
                    onClick={() => onSubmit(resumeText)}
                    disabled={!resumeText.trim() || isSubmitting}
                    className={cn(
                        "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]",
                        !resumeText.trim() || isSubmitting
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                            : "text-white hover:opacity-90 hover:shadow-xl"
                    )}
                    style={resumeText.trim() && !isSubmitting
                        ? { background: `linear-gradient(135deg, ${style.color}, ${style.color}cc)` }
                        : {}
                    }
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Preparing Interview…
                        </>
                    ) : (
                        <>
                            Start Interview
                            <Play className="w-4 h-4 fill-current" />
                        </>
                    )}
                </button>

            </div>
        </div>
    );
};
