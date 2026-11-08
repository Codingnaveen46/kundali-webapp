"use client";

import React, { useState } from "react";
import { SouthIndianChart } from "./SouthIndianChart";
import { NorthIndianChart } from "./NorthIndianChart";
import { EastIndianChart } from "./EastIndianChart";
import { PlanetPosition, LagnaInfo } from "@/lib/types";
import { Download, Sparkles } from "lucide-react";

export type ChartStyle = "south" | "north" | "east";

interface ChartContainerProps {
  planets: Record<string, PlanetPosition>;
  lagna: LagnaInfo | null;
  defaultStyle?: ChartStyle;
  theme?: "light" | "dark";
  labels?: {
    south: string;
    north: string;
    east: string;
    d1: string;
    d9: string;
  };
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  planets,
  lagna,
  defaultStyle = "south", // South Indian style is default as required
  theme = "dark",
  labels = {
    south: "South Indian",
    north: "North Indian",
    east: "East Indian",
    d1: "Lagna (D1)",
    d9: "Navamsa (D9)"
  }
}) => {
  const [style, setStyle] = useState<ChartStyle>(defaultStyle);
  const [division, setDivision] = useState<"d1" | "d9">("d1");

  const isNavamsa = division === "d9";
  const title = isNavamsa ? labels.d9 : labels.d1;

  return (
    <div className="flex flex-col items-center w-full bg-white dark:bg-stone-900/50 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
      {/* Controls: Chart Division & Chart Style */}
      <div className="flex flex-wrap items-center justify-between w-full max-w-[440px] mb-4 gap-2">
        {/* D1 / D9 Switcher */}
        <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
          <button
            onClick={() => setDivision("d1")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              division === "d1"
                ? "bg-amber-600 text-white shadow"
                : "text-stone-600 dark:text-stone-300 hover:text-stone-900"
            }`}
          >
            {labels.d1}
          </button>
          <button
            onClick={() => setDivision("d9")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              division === "d9"
                ? "bg-amber-600 text-white shadow"
                : "text-stone-600 dark:text-stone-300 hover:text-stone-900"
            }`}
          >
            {labels.d9}
          </button>
        </div>

        {/* Style Switcher (South Indian Default) */}
        <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
          <button
            onClick={() => setStyle("south")}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              style === "south"
                ? "bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 font-bold shadow-sm"
                : "text-stone-600 dark:text-stone-400"
            }`}
            title="South Indian (Fixed Zodiac)"
          >
            {labels.south}
          </button>
          <button
            onClick={() => setStyle("north")}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              style === "north"
                ? "bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 font-bold shadow-sm"
                : "text-stone-600 dark:text-stone-400"
            }`}
            title="North Indian (Diamond / Fixed Houses)"
          >
            {labels.north}
          </button>
          <button
            onClick={() => setStyle("east")}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              style === "east"
                ? "bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 font-bold shadow-sm"
                : "text-stone-600 dark:text-stone-400"
            }`}
            title="East Indian (Bengal/Odisha)"
          >
            {labels.east}
          </button>
        </div>
      </div>

      {/* Render Chart */}
      <div id={`chart-render-${division}-${style}`} className="w-full flex justify-center">
        {style === "south" && (
          <SouthIndianChart
            planets={planets}
            lagna={lagna}
            isNavamsa={isNavamsa}
            chartTitle={title}
            theme={theme}
          />
        )}
        {style === "north" && (
          <NorthIndianChart
            planets={planets}
            lagna={lagna}
            isNavamsa={isNavamsa}
            chartTitle={title}
            theme={theme}
          />
        )}
        {style === "east" && (
          <EastIndianChart
            planets={planets}
            lagna={lagna}
            isNavamsa={isNavamsa}
            chartTitle={title}
            theme={theme}
          />
        )}
      </div>

      <div className="mt-3 flex items-center justify-between w-full max-w-[440px] text-[11px] text-stone-500">
        <span>SVG Vector Crisp Format</span>
        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
          <Sparkles className="w-3.5 h-3.5" /> High Precision Ephemeris
        </span>
      </div>
    </div>
  );
};
