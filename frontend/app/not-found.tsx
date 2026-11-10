import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen celestial-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl max-w-md space-y-4">
        <h2 className="text-4xl font-extrabold text-stone-900 dark:text-stone-100 font-serif-vedic">404</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          The requested page could not be found.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
        >
          Return to Kundli Home
        </Link>
      </div>
    </div>
  );
}
