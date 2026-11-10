"use client";

import React from "react";
import { PlanetPosition, LagnaInfo } from "@/lib/types";

interface SouthIndianChartProps {
  planets: Record<string, PlanetPosition>;
  lagna: LagnaInfo | null;
  isNavamsa?: boolean;
  chartTitle?: string;
  theme?: "light" | "dark";
  /** Multiplier applied to all text inside the chart (print layouts use > 1 for legibility at reduced chart width). */
  labelScale?: number;
  lang?: "en" | "kn";
}

// Fixed positions of the 12 signs in the classical South Indian 4x4 grid
// Grid coordinates: col (0 to 3), row (0 to 3)
const SIGN_COORDINATES: Record<string, { col: number; row: number; label: string; sa: string; kn: string }> = {
  Pisces:      { col: 0, row: 0, label: "Pisces", sa: "Meena", kn: "ಮೀನ" },
  Aries:       { col: 1, row: 0, label: "Aries", sa: "Mesha", kn: "ಮೇಷ" },
  Taurus:      { col: 2, row: 0, label: "Taurus", sa: "Vrishabha", kn: "ವೃಷಭ" },
  Gemini:      { col: 3, row: 0, label: "Gemini", sa: "Mithuna", kn: "ಮಿಥುನ" },
  Cancer:      { col: 3, row: 1, label: "Cancer", sa: "Karka", kn: "ಕರ್ಕಾಟಕ" },
  Leo:         { col: 3, row: 2, label: "Leo", sa: "Simha", kn: "ಸಿಂಹ" },
  Virgo:       { col: 3, row: 3, label: "Virgo", sa: "Kanya", kn: "ಕನ್ಯಾ" },
  Libra:       { col: 2, row: 3, label: "Libra", sa: "Tula", kn: "ತುಲಾ" },
  Scorpio:     { col: 1, row: 3, label: "Scorpio", sa: "Vrischika", kn: "ವೃಶ್ಚಿಕ" },
  Sagittarius: { col: 0, row: 3, label: "Sagittarius", sa: "Dhanu", kn: "ಧನು" },
  Capricorn:   { col: 0, row: 2, label: "Capricorn", sa: "Makara", kn: "ಮಕರ" },
  Aquarius:    { col: 0, row: 1, label: "Aquarius", sa: "Kumbha", kn: "ಕುಂಭ" },
};

const PLANET_SHORT_NAMES: Record<string, string> = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke",
};

const PLANET_SHORT_NAMES_KN: Record<string, string> = {
  Sun: "ರ",
  Moon: "ಚಂ",
  Mars: "ಕು",
  Mercury: "ಬು",
  Jupiter: "ಗು",
  Venus: "ಶು",
  Saturn: "ಶ",
  Rahu: "ರಾ",
  Ketu: "ಕೇ",
};

export const SouthIndianChart: React.FC<SouthIndianChartProps> = ({
  planets,
  lagna,
  isNavamsa = false,
  chartTitle,
  theme = "dark",
  labelScale = 1,
  lang = "en",
}) => {
  const size = 440;
  const cellSize = size / 4;
  const s = labelScale;

  // Group planets by their respective sign in D1 or D9
  const planetsBySign: Record<string, Array<{ name: string; deg: string; isR: boolean; isC: boolean }>> = {};
  Object.keys(SIGN_COORDINATES).forEach(s => {
    planetsBySign[s] = [];
  });

  Object.values(planets).forEach(p => {
    const targetSign = isNavamsa ? (p.navamsa_sign || p.sign) : p.sign;
    if (planetsBySign[targetSign]) {
      const degStr = `${p.degree_in_sign}°${String(p.minute_in_sign).padStart(2, "0")}'`;
      const shortName = lang === "kn"
        ? (PLANET_SHORT_NAMES_KN[p.name] || p.name.slice(0, 2))
        : (PLANET_SHORT_NAMES[p.name] || p.name.slice(0, 2));
      planetsBySign[targetSign].push({
        name: shortName,
        // D9 (Navamsa) charts show planet abbreviations only: the degree,
        // retrograde and combust flags come from the D1 chart and would
        // misrepresent the Navamsa placement.
        deg: isNavamsa ? "" : degStr,
        isR: !isNavamsa && p.is_retrograde,
        isC: !isNavamsa && p.is_combust
      });
    }
  });

  const lagnaSign = lagna ? (isNavamsa ? lagna.navamsa_sign : lagna.sign) : null;
  const isDark = theme === "dark";

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[440px] aspect-square rounded-xl shadow-lg border border-amber-900/30 bg-amber-50/20 dark:bg-stone-900/90 text-stone-900 dark:text-stone-100 font-sans select-none"
      >
        {/* Outer and inner grid lines */}
        <rect
          x="1"
          y="1"
          width={size - 2}
          height={size - 2}
          fill="none"
          stroke={isDark ? "#78350f" : "#b45309"}
          strokeWidth="2.5"
          rx="8"
        />

        {/* Horizontal grid lines */}
        <line x1="0" y1={cellSize} x2={size} y2={cellSize} stroke={isDark ? "#57534e" : "#d6d3d1"} strokeWidth="1.5" />
        <line x1="0" y1={cellSize * 2} x2={cellSize} y2={cellSize * 2} stroke={isDark ? "#57534e" : "#d6d3d1"} strokeWidth="1.5" />
        <line x1={cellSize * 3} y1={cellSize * 2} x2={size} y2={cellSize * 2} stroke={isDark ? "#57534e" : "#d6d3d1"} strokeWidth="1.5" />
        <line x1="0" y1={cellSize * 3} x2={size} y2={cellSize * 3} stroke={isDark ? "#57534e" : "#d6d3d1"} strokeWidth="1.5" />

        {/* Vertical grid lines */}
        <line x1={cellSize} y1="0" x2={cellSize} y2={size} stroke={isDark ? "#57534e" : "#d6d3d1"} strokeWidth="1.5" />
        <line x1={cellSize * 2} y1="0" x2={cellSize * 2} y2={cellSize} stroke={isDark ? "#57534e" : "#d6d3d1"} strokeWidth="1.5" />
        <line x1={cellSize * 2} y1={cellSize * 3} x2={cellSize * 2} y2={size} stroke={isDark ? "#57534e" : "#d6d3d1"} strokeWidth="1.5" />
        <line x1={cellSize * 3} y1="0" x2={cellSize * 3} y2={size} stroke={isDark ? "#57534e" : "#d6d3d1"} strokeWidth="1.5" />

        {/* Center Box: Chart Metadata */}
        <rect
          x={cellSize}
          y={cellSize}
          width={cellSize * 2}
          height={cellSize * 2}
          fill={isDark ? "#1c1917" : "#fef3c7"}
          fillOpacity="0.4"
          stroke={isDark ? "#78350f" : "#b45309"}
          strokeWidth="1.5"
        />
        <text
          x={size / 2}
          y={size / 2 - 25 * s}
          textAnchor="middle"
          className="fill-amber-600 dark:fill-amber-400 font-bold"
          fontSize={14 * s}
        >
          {chartTitle || (isNavamsa ? (lang === "kn" ? "ನವಾಂಶ ಕುಂಡಲಿ (D9)" : "Navamsa (D9)") : (lang === "kn" ? "ಜನ್ಮ ಕುಂಡಲಿ (D1)" : "Janma Rashi (D1)"))}
        </text>
        <text
          x={size / 2}
          y={size / 2 - 4 * s}
          textAnchor="middle"
          className="fill-stone-600 dark:fill-stone-300 font-medium"
          fontSize={12 * s}
        >
          {lagnaSign
            ? (lang === "kn" ? `ಲಗ್ನ: ${SIGN_COORDINATES[lagnaSign]?.kn || lagnaSign}` : `Asc: ${lagnaSign}`)
            : (lang === "kn" ? "ಚಂದ್ರ ಲಗ್ನ" : "Chandra Lagna")}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 16 * s}
          textAnchor="middle"
          className="fill-stone-500 dark:fill-stone-400"
          fontSize={11 * s}
        >
          {lang === "kn" ? "ದಕ್ಷಿಣ ಭಾರತೀಯ ಶೈಲಿ" : "South Indian Format"}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 34 * s}
          textAnchor="middle"
          className="fill-amber-700/80 dark:fill-amber-500/80"
          fontSize={10 * s}
        >
          {lang === "kn" ? "ಲಾಹಿರಿ ಅಯನಾಂಶ • ಸ್ಥಿರ ರಾಶಿಗಳು" : "Lahiri Ayanamsa • Fixed Signs"}
        </text>

        {/* 12 Sign Cells */}
        {Object.entries(SIGN_COORDINATES).map(([signName, coord]) => {
          const x = coord.col * cellSize;
          const y = coord.row * cellSize;
          const isLagnaCell = lagnaSign === signName;
          const signPlanets = planetsBySign[signName] || [];

          return (
            <g key={signName} transform={`translate(${x}, ${y})`}>
              {/* Highlight if Lagna */}
              {isLagnaCell && (
                <>
                  <rect
                    x="2"
                    y="2"
                    width={cellSize - 4}
                    height={cellSize - 4}
                    fill={isDark ? "#b45309" : "#fef08a"}
                    fillOpacity={isDark ? "0.15" : "0.35"}
                  />
                  {/* Classical South Indian double diagonal corner mark for Lagna */}
                  <line
                    x1="2"
                    y1={13 * s}
                    x2={13 * s}
                    y2="2"
                    stroke={isDark ? "#f59e0b" : "#b45309"}
                    strokeWidth="1.8"
                  />
                  <line
                    x1="2"
                    y1={18 * s}
                    x2={18 * s}
                    y2="2"
                    stroke={isDark ? "#f59e0b" : "#b45309"}
                    strokeWidth="1.8"
                  />
                  <text
                    x={22 * s}
                    y={14 * s}
                    className="fill-amber-600 dark:fill-amber-400 font-extrabold"
                    fontSize={10.5 * s}
                  >
                    {lang === "kn" ? "ಲಗ್ನ" : "Asc"}
                  </text>
                </>
              )}

              {/* Rashi Name in Top Right corner */}
              <text
                x={cellSize - 6}
                y={14 * s}
                textAnchor="end"
                className="fill-stone-400 dark:fill-stone-500 font-semibold tracking-wider"
                fontSize={9 * s}
              >
                {lang === "kn" ? coord.kn : coord.sa}
              </text>

              {/* Planets inside this Rashi box */}
              {signPlanets.map((p, idx) => {
                const py = 28 * s + idx * 16 * s;
                return (
                  <g key={`${p.name}-${idx}`} transform={`translate(8, ${py})`}>
                    <text
                      x="0"
                      y="0"
                      className="fill-stone-900 dark:fill-stone-100 font-bold"
                      fontSize={11.5 * s}
                    >
                      <tspan>{p.name}</tspan>
                      {p.isR && (
                        <tspan className="fill-rose-500 font-bold" dx={2.5 * s}>
                          {lang === "kn" ? "(ವ)" : "(R)"}
                        </tspan>
                      )}
                      {p.isC && (
                        <tspan className="fill-amber-500 font-bold" dx={2 * s}>
                          {lang === "kn" ? "(ಅ)" : "(C)"}
                        </tspan>
                      )}
                    </text>
                    {p.deg ? (
                      <text
                        x={cellSize - 18}
                        y="0"
                        textAnchor="end"
                        className="fill-stone-500 dark:fill-stone-400"
                        fontSize={9.5 * s}
                      >
                        {p.deg}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
