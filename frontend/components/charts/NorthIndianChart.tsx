"use client";

import React from "react";
import { PlanetPosition, LagnaInfo } from "@/lib/types";

interface NorthIndianChartProps {
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

export const NorthIndianChart: React.FC<NorthIndianChartProps> = ({
  planets,
  lagna,
  isNavamsa = false,
  chartTitle,
  theme = "dark"
}) => {
  const size = 440;
  const isDark = theme === "dark";

  // Lagna sign index (0 = Aries ... 11 = Pisces)
  const lagnaSignIdx = lagna ? (isNavamsa ? lagna.navamsa_sign_idx : lagna.sign_idx) : 0;

  // Group planets by house (1 to 12)
  const planetsByHouse: Record<number, Array<{ name: string; isR: boolean; isC: boolean }>> = {};
  for (let i = 1; i <= 12; i++) planetsByHouse[i] = [];

  Object.values(planets).forEach(p => {
    const targetSignIdx = isNavamsa ? (p.navamsa_sign_idx ?? p.sign_idx) : p.sign_idx;
    // House = ((targetSignIdx - lagnaSignIdx) % 12) + 1
    const h = (((targetSignIdx - lagnaSignIdx) % 12) + 12) % 12 + 1;
    planetsByHouse[h].push({
      name: PLANET_SHORT_NAMES[p.name] || p.name.slice(0, 2),
      isR: p.is_retrograde,
      isC: p.is_combust
    });
  });

  // Centers & sign numbers for each of the 12 houses
  // In North Indian style:
  // House 1: (220, 110)
  // House 2: (110, 55)
  // House 3: (55, 110)
  // House 4: (110, 220)
  // House 5: (55, 330)
  // House 6: (110, 385)
  // House 7: (220, 330)
  // House 8: (330, 385)
  // House 9: (385, 330)
  // House 10: (330, 220)
  // House 11: (385, 110)
  // House 12: (330, 55)
  const houseCoords: Record<number, { cx: number; cy: number; signNumX: number; signNumY: number }> = {
    1:  { cx: 220, cy: 110, signNumX: 220, signNumY: 175 },
    2:  { cx: 110, cy: 55,  signNumX: 185, signNumY: 35 },
    3:  { cx: 55,  cy: 110, signNumX: 35,  signNumY: 185 },
    4:  { cx: 110, cy: 220, signNumX: 175, signNumY: 220 },
    5:  { cx: 55,  cy: 330, signNumX: 35,  signNumY: 255 },
    6:  { cx: 110, cy: 385, signNumX: 185, signNumY: 405 },
    7:  { cx: 220, cy: 330, signNumX: 220, signNumY: 265 },
    8:  { cx: 330, cy: 385, signNumX: 255, signNumY: 405 },
    9:  { cx: 385, cy: 330, signNumX: 405, signNumY: 255 },
    10: { cx: 330, cy: 220, signNumX: 265, signNumY: 220 },
    11: { cx: 385, cy: 110, signNumX: 405, signNumY: 185 },
    12: { cx: 330, cy: 55,  signNumX: 255, signNumY: 35 },
  };

  const strokeColor = isDark ? "#78350f" : "#b45309";
  const innerLineColor = isDark ? "#57534e" : "#d6d3d1";

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[440px] aspect-square rounded-xl shadow-lg border border-amber-900/30 bg-amber-50/20 dark:bg-stone-900/90 text-stone-900 dark:text-stone-100 font-sans select-none"
      >
        {/* Outer Square */}
        <rect x="2" y="2" width={size - 4} height={size - 4} fill="none" stroke={strokeColor} strokeWidth="2.5" rx="8" />

        {/* Diagonal Cross (X) */}
        <line x1="0" y1="0" x2={size} y2={size} stroke={innerLineColor} strokeWidth="1.5" />
        <line x1={size} y1="0" x2="0" y2={size} stroke={innerLineColor} strokeWidth="1.5" />

        {/* Central Diamond connecting midpoints (0, 220), (220, 0), (440, 220), (220, 440) */}
        <polygon
          points={`0,${size/2} ${size/2},0 ${size},${size/2} ${size/2},${size}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
        />

        {/* Chart Title Header in House 1 top */}
        <text
          x={size / 2}
          y="24"
          textAnchor="middle"
          className="fill-amber-600 dark:fill-amber-400 font-bold text-xs"
        >
          {chartTitle || (isNavamsa ? "Navamsa (D9)" : "Janma Kundali (D1)")} - North Indian
        </text>

        {/* Render 12 Houses */}
        {Object.entries(houseCoords).map(([hStr, coord]) => {
          const h = Number(hStr);
          // Sign number = ((lagnaSignIdx + (h - 1)) % 12) + 1 (1 = Aries ... 12 = Pisces)
          const signNumber = ((lagnaSignIdx + h - 1) % 12) + 1;
          const housePlanets = planetsByHouse[h] || [];

          return (
            <g key={`house-${h}`}>
              {/* Sign Number */}
              <text
                x={coord.signNumX}
                y={coord.signNumY}
                textAnchor="middle"
                className="fill-stone-400 dark:fill-stone-500 font-semibold text-[11px]"
              >
                {signNumber}
              </text>

              {/* Planets in this House */}
              <g transform={`translate(${coord.cx}, ${coord.cy})`}>
                {housePlanets.map((p, idx) => {
                  const offset = (idx - (housePlanets.length - 1) / 2) * 16;
                  return (
                    <text
                      key={`${p.name}-${idx}`}
                      x="0"
                      y={offset}
                      textAnchor="middle"
                      className="fill-stone-900 dark:fill-stone-100 font-bold text-[11px]"
                    >
                      {p.name}
                      {p.isR && <tspan className="fill-rose-500 font-bold text-[9px]">(R)</tspan>}
                      {p.isC && <tspan className="fill-amber-500 font-bold text-[9px]">(C)</tspan>}
                    </text>
                  );
                })}
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
