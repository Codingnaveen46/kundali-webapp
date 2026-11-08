"use client";

import React from "react";
import { Shield, Code2, BookOpen } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 py-10 px-4 text-xs text-stone-500">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Column 1: App summary & source code */}
          <div className="space-y-2">
            <div className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <span>Kundli</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400">
                AGPL-3.0 Open Source
              </span>
            </div>
            <p className="text-xs leading-relaxed">
              Vedic Astrology (Jyotish) engine powered by Swiss Ephemeris with classical Parashari algorithms, whole-sign and Placidus houses, and Ashtakoota Milan.
            </p>
            <div className="pt-1">
              <a
                href="https://github.com/astrodienst/swisseph"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 font-semibold underline"
              >
                <Code2 className="w-3.5 h-3.5" /> Source code (AGPL-3.0 / Swiss Ephemeris)
              </a>
            </div>
          </div>

          {/* Column 2: Privacy & DPDP Act */}
          <div className="space-y-2">
            <div className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>India DPDP Act Compliance</span>
            </div>
            <p className="text-xs leading-relaxed">
              Stateless calculation pipeline. Zero permanent storage by default. Uploaded documents are parsed strictly in memory with EXIF stripped and immediately discarded.
            </p>
            <div className="text-[11px] text-stone-400">
              One-click session wipe available at any time.
            </div>
          </div>

          {/* Column 3: Classical Integrity & Disclaimer */}
          <div className="space-y-2">
            <div className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Classical Integrity</span>
            </div>
            <p className="text-xs leading-relaxed">
              Strictly references classical treatises including Brihat Parashara Hora Shastra, Muhurtha Chintamani, and Jataka Parijata. Table matrices are versioned with zero invented values.
            </p>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-4 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-400 text-center leading-relaxed">
          <strong>Astrological Disclaimer:</strong> Vedic astrology is a cultural and symbolic tradition. The generated charts and compatibility indicators are intended for personal reflection and informational purposes only. They do not constitute scientific, medical, financial, or legal advice. No fear-based claims or paid remedial guarantees are endorsed.
        </div>
      </div>
    </footer>
  );
};
