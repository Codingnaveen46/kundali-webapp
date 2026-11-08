"use client";

import React, { useState } from "react";
import { extractFromText } from "@/lib/api";
import { ExtractionResponse } from "@/lib/types";
import { Clipboard, Sparkles, Loader2, Image as ImageIcon } from "lucide-react";

interface PasteTextProps {
  onExtracted: (response: ExtractionResponse) => void;
}

const PRESET_SAMPLES = [
  {
    label: "Sample 1: Standard Biodata",
    text: "Name: Rajesh Kumar\nGender: Male\nDOB: 15-08-1994\nTOB: 06:45 AM\nPOB: Bengaluru\nRashi: Vrishabha\nNakshatra: Rohini\nGothra: Kashyapa"
  },
  {
    label: "Sample 2: WhatsApp Forward",
    text: "*Matrimonial Profile*\nName: Sneha Patil\nBorn: 24/11/1996 at 11:20 PM in Pune\nNakshatra: Rohini, Rashi: Vrishabha\nEducation: BE Computer Science"
  },
  {
    label: "Sample 3: Ambiguous Date (04-06-1998)",
    text: "Name: Sunita Rao\nDOB: 04-06-1998\nTOB: 10:15 AM\nPlace: Mysuru (Mysore)"
  },
  {
    label: "Sample 4: Dual Profiles (Groom & Bride)",
    text: "Groom:\nName: Ajay Mehra\nDOB: 14-05-1992\nTOB: 10:00 AM\nPOB: New Delhi\n\nBride:\nName: Pooja Gupta\nDOB: 18-08-1994\nTOB: 04:15 PM\nPOB: Jaipur"
  }
];

export const PasteText: React.FC<PasteTextProps> = ({ onExtracted }) => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!text.trim()) {
      setError("Please paste biodata text before extracting.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await extractFromText(text);
      onExtracted(res);
    } catch (err: any) {
      setError(err.message || "Failed to parse biodata text.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText(clipText);
      }
    } catch (e) {
      // Permission error or clipboard empty
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
          <Clipboard className="w-4 h-4 text-amber-600" /> Paste Biodata Text or WhatsApp Message
        </label>
        <button
          type="button"
          onClick={handlePasteClipboard}
          className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
        >
          Paste from Clipboard
        </button>
      </div>

      <textarea
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste copied biodata text, WhatsApp forward, or key-value details in any order..."
        className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none font-mono"
      />

      {/* Preset sample buttons */}
      <div>
        <span className="text-xs text-stone-500 block mb-1.5">Or try a preloaded sample:</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_SAMPLES.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setText(s.text)}
              className="px-2.5 py-1 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs rounded-xl border border-rose-200 dark:border-rose-900">
          {error}
        </div>
      )}

      <button
        type="button"
        disabled={isLoading || !text.trim()}
        onClick={handleExtract}
        className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Extracting Details...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" /> Extract & Review Details
          </>
        )}
      </button>
    </div>
  );
};
