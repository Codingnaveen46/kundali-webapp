"use client";

import React from "react";
import { Shield, Code2, BookOpen, Sparkles, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-stone-200/80 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 backdrop-blur-md py-12 px-4 sm:px-6 text-xs text-stone-500 no-print">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Column 1: App summary & source code */}
          <div className="space-y-2.5">
            <div className="font-extrabold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2 font-serif-vedic">
              <span>Kundli</span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                AGPL-3.0 Open Source
              </span>
            </div>
            <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">
              Vedic Astrology (Jyotish) engine powered by Swiss Ephemeris with classical Parashari algorithms, whole-sign and Placidus houses, and Ashtakoota Milan.
            </p>
            <div className="pt-1">
              <a
                href="https://github.com/astrodienst/swisseph"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 dark:text-amber-400 font-bold underline"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Source code (AGPL-3.0 / Swiss Ephemeris)</span>
              </a>
            </div>
          </div>

          {/* Column 2: Privacy & DPDP Act */}
          <div className="space-y-2.5">
            <div className="font-extrabold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>India DPDP Act Compliance</span>
            </div>
            <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">
              Stateless calculation pipeline. Zero permanent storage by default. Uploaded documents are parsed strictly in memory with EXIF stripped and immediately discarded.
            </p>
            <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              One-click session wipe available at any time.
            </div>
          </div>

          {/* Column 3: Classical Integrity & Disclaimer */}
          <div className="space-y-2.5">
            <div className="font-extrabold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Classical Integrity</span>
            </div>
            <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">
              Strictly references classical treatises including Brihat Parashara Hora Shastra, Muhurtha Chintamani, and Jataka Parijata. Table matrices are versioned with zero invented values.
            </p>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-6 border-t border-stone-200/60 dark:border-stone-800 text-[11px] text-stone-400 text-center leading-relaxed max-w-3xl mx-auto">
          <strong>Astrological Disclaimer:</strong> Vedic astrology is a cultural and symbolic tradition. The generated charts and compatibility indicators are intended for personal reflection and informational purposes only. They do not constitute scientific, medical, financial, or legal advice. No fear-based claims or paid remedial guarantees are endorsed.
        </div>

        {/* Signature */}
        <div className="pt-8 pb-2 text-center space-y-2.5">
          <div className="flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent via-amber-400/60 to-amber-400/60" />
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent via-amber-400/60 to-amber-400/60" />
          </div>
          <p className="text-sm sm:text-base italic font-serif-vedic text-stone-600 dark:text-amber-100/90">
            &ldquo;As above, so below — as the universe, so the soul.&rdquo;
          </p>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1.5">
            Crafted with
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" aria-label="love" />
            by Naveen
          </p>
        </div>
      </div>
    </footer>
  );
};
