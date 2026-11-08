"use client";

import React from "react";
import { LanguageCode, TRANSLATIONS } from "@/i18n/translations";
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
    <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs overflow-x-auto max-w-[210px] sm:max-w-none">
      <Globe className="w-3.5 h-3.5 text-stone-400 ml-1 shrink-0 hidden xs:block" />
      <div className="flex gap-0.5 shrink-0">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => onSelectLang(lang.code)}
            className={`shrink-0 px-2 py-1 rounded-lg font-medium transition-all ${
              currentLang === lang.code
                ? "bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 font-bold shadow-sm"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
};
