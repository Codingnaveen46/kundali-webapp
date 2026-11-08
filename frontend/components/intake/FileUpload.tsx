"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, Loader2, Sparkles, CheckCircle } from "lucide-react";
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
        className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
            : "border-stone-300 dark:border-stone-700 hover:border-amber-400 bg-stone-50/50 dark:bg-stone-800/40"
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

        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
          <Upload className="w-6 h-6" />
        </div>

        <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
          {file ? file.name : "Tap to upload or drag & drop biodata image or PDF"}
        </p>
        <p className="text-xs text-stone-500 mt-1">
          Supports JPG, PNG, WEBP, HEIC, PDF (Max 10 MB, up to 2 pages)
        </p>

        {file && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle className="w-4 h-4" /> Ready to extract: {(file.size / 1024).toFixed(0)} KB
          </div>
        )}
      </div>

      {/* Helpful Tips Banner */}
      <div className="p-3 bg-stone-100 dark:bg-stone-800/60 rounded-xl text-xs text-stone-600 dark:text-stone-400 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-stone-700 dark:text-stone-300 block mb-0.5">
            Tips for best extraction:
          </span>
          Keep the document upright, ensure adequate lighting, avoid cropping dates or times, and ensure handwritten or printed text is clear.
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs rounded-xl border border-rose-200 dark:border-rose-900">
          {error}
        </div>
      )}

      <button
        type="button"
        disabled={isLoading || !file}
        onClick={handleUpload}
        className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Processing Upload in Memory...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" /> Extract Biodata
          </>
        )}
      </button>
    </div>
  );
};
