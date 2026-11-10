"use client";

import React, { useState, useRef } from "react";
import { Upload, AlertCircle, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { ExtractionResponse } from "@/lib/types";

interface FileUploadProps {
  onExtracted: (response: ExtractionResponse) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onExtracted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = (selectedFile: File) => {
    setError(null);
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File exceeds maximum allowed size of 10 MB.");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/intake/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(errJson.detail || "Upload error");
      }

      const data: ExtractionResponse = await res.json();
      onExtracted(data);
    } catch (err: any) {
      setError(err.message || "Failed to process document. Please ensure text is legible.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelection(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? "border-amber-500 bg-amber-500/10 dark:bg-amber-950/30 scale-[1.01]"
            : "border-stone-300 dark:border-stone-700 hover:border-amber-500/80 bg-stone-50/50 dark:bg-stone-800/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelection(e.target.files[0]);
            }
          }}
        />

        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 shadow-inner">
          <Upload className="w-6 h-6" />
        </div>

        <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
          {file ? file.name : "Tap to upload or drag & drop biodata image or PDF"}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Supports JPG, PNG, WEBP, HEIC, PDF (Max 10 MB, up to 2 pages)
        </p>

        {file && (
          <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Ready to extract: {(file.size / 1024).toFixed(0)} KB</span>
          </div>
        )}
      </div>

      {/* Helpful Tips Banner */}
      <div className="p-3.5 bg-stone-100/80 dark:bg-stone-800/60 rounded-2xl text-xs text-stone-600 dark:text-stone-400 flex items-start gap-2.5 border border-stone-200/50 dark:border-stone-700/50">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-stone-800 dark:text-stone-200 block mb-0.5">
            Tips for best extraction:
          </span>
          Keep the document upright, ensure adequate lighting, avoid cropping dates or times, and ensure handwritten or printed text is clear.
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs rounded-2xl border border-rose-200 dark:border-rose-900 shadow-sm">
          {error}
        </div>
      )}

      <button
        type="button"
        disabled={isLoading || !file}
        onClick={handleUpload}
        className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-40 text-white font-extrabold rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2 text-sm active:scale-98"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Processing Upload in Memory...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Extract Biodata</span>
          </>
        )}
      </button>
    </div>
  );
};
