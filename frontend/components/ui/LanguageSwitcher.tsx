"use client";

import React from "react";
import { LanguageCode } from "@/i18n/translations";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
}

const LANGUAGES: Array<{ code: LanguageCode; label: string }> = [
  { code: "en", label: "English" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "hi", label: "हिन्दी" },
  { code: "te", label: "తెలుగు" },
  { code: "ta", label: "தமிழ்" },
];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLang,
  onSelectLang,
}) => {
  return (
    <div className="flex items-center gap-1 bg-stone-100/90 dark:bg-stone-800/90 p-1 rounded-2xl text-xs overflow-x-auto max-w-[210px] sm:max-w-none border border-stone-200/60 dark:border-stone-700/60 shadow-inner">
      <Globe className="w-3.5 h-3.5 text-stone-400 ml-1.5 shrink-0 hidden xs:block" />
      <div className="flex gap-0.5 shrink-0">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => onSelectLang(lang.code)}
            className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              currentLang === lang.code
                ? "bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 shadow-sm shadow-stone-900/5 ring-1 ring-stone-900/5"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
};
