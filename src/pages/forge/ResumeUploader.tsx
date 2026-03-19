import { useRef, useState } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import * as pdfjs from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { supabase } from "@/integrations/supabase/client";
import { ResumeData } from "./types";

// pdfjs worker — Vite bundles this correctly via ?url import
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

interface Props {
  onParsed: (data: ResumeData) => void;
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(" ") + "\n";
  }
  return text;
}

async function extractTextFromDOCX(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

const ACCEPTED = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export default function ResumeUploader({ onParsed }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<"idle" | "extracting" | "parsing" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const process = async (f: File) => {
    if (!ACCEPTED.includes(f.type)) {
      setError("Only PDF and DOCX files are supported.");
      return;
    }
    setFile(f);
    setError("");
    setStage("extracting");

    try {
      let text = "";
      if (f.type === "application/pdf") {
        text = await extractTextFromPDF(f);
      } else {
        text = await extractTextFromDOCX(f);
      }

      setStage("parsing");

      const { data, error: fnErr } = await supabase.functions.invoke("parse-resume", {
        body: { resumeText: text },
      });

      if (fnErr || !data?.data) throw new Error(fnErr?.message || "Parsing failed");

      setStage("done");
      onParsed(data.data);
    } catch (err: any) {
      setStage("error");
      setError(err.message || "Something went wrong. Try again.");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) process(f);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) process(f);
  };

  const reset = () => {
    setFile(null);
    setStage("idle");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const isProcessing = stage === "extracting" || stage === "parsing";

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !isProcessing && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed
          transition-all duration-300 cursor-pointer select-none
          ${dragging ? "border-stone-400 bg-stone-100 scale-[1.02]" : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"}
          ${isProcessing ? "cursor-default pointer-events-none" : ""}
          p-12
        `}
        style={{ boxShadow: dragging ? "0 8px 32px rgba(0,0,0,0.08)" : "0 2px 12px rgba(0,0,0,0.04)" }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={onFileChange}
        />

        {isProcessing ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-stone-500 animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-['Merriweather'] font-bold text-stone-800 text-sm">
                {stage === "extracting" ? "Reading your resume…" : "Analysing with AI…"}
              </p>
              <p className="font-['Inter'] text-stone-400 text-xs mt-1">
                {stage === "extracting" ? "Extracting text from your file" : "Identifying skills, education, projects…"}
              </p>
            </div>
          </>
        ) : stage === "done" && file ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <FileText className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="font-['Merriweather'] font-bold text-stone-800 text-sm">{file.name}</p>
              <p className="font-['Inter'] text-emerald-600 text-xs mt-1 font-medium">Successfully parsed</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-stone-500" />
            </button>
          </>
        ) : (
          <>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors"
              style={{ background: dragging ? "#e7e5e4" : "#f5f5f4" }}
            >
              <Upload className="w-7 h-7 text-stone-500" />
            </div>
            <div className="text-center">
              <p className="font-['Merriweather'] font-bold text-stone-800 text-sm">
                Drop your resume here
              </p>
              <p className="font-['Inter'] text-stone-400 text-xs mt-1">
                PDF or DOCX · Click or drag & drop
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-[11px] font-['Inter'] font-medium">PDF</span>
              <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-[11px] font-['Inter'] font-medium">DOCX</span>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="mt-3 text-center text-red-500 text-xs font-['Inter']">{error}</p>
      )}
    </div>
  );
}
