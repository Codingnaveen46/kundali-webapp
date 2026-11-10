"use client";

import React from "react";
import { PlanetPosition, LagnaInfo } from "@/lib/types";

interface EastIndianChartProps {
  planets: Record<string, PlanetPosition>;
  lagna: LagnaInfo | null;
  isNavamsa?: boolean;
  chartTitle?: string;
  theme?: "light" | "dark";
}

const PLANET_SHORT_NAMES: Record<string, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me",
  Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke"
};

export const EastIndianChart: React.FC<EastIndianChartProps> = ({
  planets,
  lagna,
  isNavamsa = false,
  chartTitle,
  theme = "dark"
}) => {
  const size = 440;
  const isDark = theme === "dark";
  const strokeColor = isDark ? "#78350f" : "#b45309";
  const innerColor = isDark ? "#57534e" : "#d6d3d1";

  const lagnaSign = lagna ? (isNavamsa ? lagna.navamsa_sign : lagna.sign) : null;

  // Group planets by sign
  const planetsBySign: Record<number, Array<{ name: string; isR: boolean; isC: boolean }>> = {};
  for (let i = 0; i < 12; i++) planetsBySign[i] = [];

  Object.values(planets).forEach(p => {
    const signIdx = isNavamsa ? (p.navamsa_sign_idx ?? p.sign_idx) : p.sign_idx;
    planetsBySign[signIdx].push({
      name: PLANET_SHORT_NAMES[p.name] || p.name.slice(0, 2),
      isR: p.is_retrograde,
      isC: p.is_combust
    });
  });

  const SANSKRIT_NAMES = [
    "Mesha", "Vrishabha", "Mithuna", "Karka",
    "Simha", "Kanya", "Tula", "Vrischika",
    "Dhanu", "Makara", "Kumbha", "Meena"
  ];

  const SIGN_CENTERS: Record<number, { cx: number; cy: number }> = {
    0:  { cx: 220, cy: 55 },
    1:  { cx: 55,  cy: 55 },
    2:  { cx: 55,  cy: 165 },
    3:  { cx: 55,  cy: 275 },
    4:  { cx: 55,  cy: 385 },
    5:  { cx: 220, cy: 385 },
    6:  { cx: 385, cy: 385 },
    7:  { cx: 385, cy: 275 },
    8:  { cx: 385, cy: 165 },
    9:  { cx: 385, cy: 55 },
    10: { cx: 275, cy: 110 },
    11: { cx: 165, cy: 110 },
  };

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[440px] aspect-square rounded-xl shadow-lg border border-amber-900/30 bg-amber-50/20 dark:bg-stone-900/90 text-stone-900 dark:text-stone-100 font-sans select-none"
      >
        <rect x="2" y="2" width={size - 4} height={size - 4} fill="none" stroke={strokeColor} strokeWidth="2.5" rx="8" />

        {/* Diagonal Cross */}
        <line x1="0" y1="0" x2={size} y2={size} stroke={innerColor} strokeWidth="1.5" />
        <line x1={size} y1="0" x2="0" y2={size} stroke={innerColor} strokeWidth="1.5" />

        {/* Inner cross dividers */}
        <line x1={size/4} y1={size/4} x2={size*3/4} y2={size/4} stroke={innerColor} strokeWidth="1.5" />
        <line x1={size/4} y1={size*3/4} x2={size*3/4} y2={size*3/4} stroke={innerColor} strokeWidth="1.5" />
        <line x1={size/4} y1={size/4} x2={size/4} y2={size*3/4} stroke={innerColor} strokeWidth="1.5" />
        <line x1={size*3/4} y1={size/4} x2={size*3/4} y2={size*3/4} stroke={innerColor} strokeWidth="1.5" />

        {/* Center label */}
        <text
          x={size / 2}
          y={size / 2 - 8}
          textAnchor="middle"
          className="fill-amber-600 dark:fill-amber-400 font-bold text-xs"
        >
          {chartTitle || (isNavamsa ? "Navamsa (D9)" : "Lagna (D1)")}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 12}
          textAnchor="middle"
          className="fill-stone-500 dark:fill-stone-400 text-[10px]"
        >
          East Indian (Bengal/Odisha)
        </text>
        <text
          x={size / 2}
          y={size / 2 + 28}
          textAnchor="middle"
          className="fill-stone-600 dark:fill-stone-300 text-[11px] font-medium"
        >
          {lagnaSign ? `Asc: ${lagnaSign}` : "Chandra Lagna"}
        </text>

        {/* Render 12 Signs & Planets */}
        {Object.entries(SIGN_CENTERS).map(([sStr, coord]) => {
          const sIdx = Number(sStr);
          const sPlanets = planetsBySign[sIdx] || [];
          const isLagna = lagna && (isNavamsa ? lagna.navamsa_sign_idx === sIdx : lagna.sign_idx === sIdx);

          return (
            <g key={`east-sign-${sIdx}`} transform={`translate(${coord.cx}, ${coord.cy})`}>
              {/* Sign label */}
              <text
                x="0"
                y="-18"
                textAnchor="middle"
                className="fill-stone-400 dark:fill-stone-500 font-semibold text-[9px]"
              >
                {SANSKRIT_NAMES[sIdx]}
                {isLagna && <tspan className="fill-amber-600 font-bold ml-1"> (ASC)</tspan>}
              </text>

              {/* Planets */}
              {sPlanets.map((p, pIdx) => {
                const py = (pIdx - (sPlanets.length - 1) / 2) * 14;
                return (
                  <text
                    key={`${p.name}-${pIdx}`}
                    x="0"
                    y={py}
                    textAnchor="middle"
                    className="fill-stone-900 dark:fill-stone-100 font-bold text-[10px]"
                  >
                    {p.name}
                    {p.isR && <tspan className="fill-rose-500 font-bold text-[8px]">(R)</tspan>}
                    {p.isC && <tspan className="fill-amber-500 font-bold text-[8px]">(C)</tspan>}
                  </text>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
