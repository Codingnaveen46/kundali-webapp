"use client";

import React, { useMemo, useRef, useState } from "react";

/**
 * ZodiacWheel — an animated, perspective-tilted astrolabe-style zodiac wheel.
 * Pure SVG + CSS animations (no 3D libraries), themed to the app's amber/gold
 * palette. Rings counter-rotate, the sun core pulses, and stars twinkle.
 * Respects `prefers-reduced-motion`.
 *
 * variant="banner"  — bounded stage for hero banners (mouse-parallax tilt).
 * variant="ambient" — fixed full-page background layer (subtle, non-interactive).
 */

const ZODIAC = [
  "\u2648\uFE0E", "\u2649\uFE0E", "\u264A\uFE0E", "\u264B\uFE0E", "\u264C\uFE0E", "\u264D\uFE0E",
  "\u264E\uFE0E", "\u264F\uFE0E", "\u2650\uFE0E", "\u2651\uFE0E", "\u2652\uFE0E", "\u2653\uFE0E",
];

/** Deterministic PRNG so server and client render identical star fields. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Star {
  x: number; y: number; size: number; delay: number; duration: number; opacity: number;
}

type ZodiacWheelProps = {
  className?: string;
  variant?: "banner" | "ambient";
};

export const ZodiacWheel: React.FC<ZodiacWheelProps> = ({ className = "", variant = "banner" }) => {
  const ambient = variant === "ambient";
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const frame = useRef<number | null>(null);

  const stars = useMemo<Star[]>(() => {
    const rand = mulberry32(20261111);
    const count = ambient ? 90 : 70;
    return Array.from({ length: count }, () => ({
      x: rand() * 100,
      y: rand() * 100,
      size: 1 + rand() * 2.2,
      delay: rand() * 5,
      duration: 2.5 + rand() * 4,
      opacity: 0.25 + rand() * 0.65,
    }));
  }, [ambient]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      setTilt({ rx: -ny * 10, ry: nx * 12 });
      frame.current = null;
    });
  };

  const tiltStyle = ambient
    ? undefined
    : { transform: `rotateX(${52 + tilt.rx}deg) rotateZ(${tilt.ry * 0.6}deg)` };

  const starField = (
    <div className="zodiac-stars">
      {stars.map((s, i) => (
        <span
          key={i}
          className="zodiac-star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );

  const wheelSvg = (
    <svg viewBox="0 0 400 400" className="zodiac-svg">
      <defs>
        <radialGradient id="zw-sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.8" />
          <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="zw-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="55%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <radialGradient id="zw-nebula" cx="70%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.22" />
          <stop offset="45%" stopColor="#92400E" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#0C0A09" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Cosmic haze */}
      <circle cx="200" cy="200" r="200" fill="url(#zw-nebula)" />

      {/* Outermost rings (slowest) */}
      <g className="zw-spin-rev-slow">
        <circle cx="200" cy="200" r="188" fill="none" stroke="#F59E0B" strokeOpacity="0.28" strokeWidth="1" />
        <circle cx="200" cy="200" r="178" fill="none" stroke="#F59E0B" strokeOpacity="0.35" strokeWidth="2.5" strokeDasharray="1.5 7" strokeLinecap="round" />
      </g>

      {/* Sign ring: zodiac glyphs on a solid band */}
      <g className="zw-spin-slow">
        <circle cx="200" cy="200" r="152" fill="none" stroke="url(#zw-gold)" strokeOpacity="0.55" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="118" fill="none" stroke="url(#zw-gold)" strokeOpacity="0.4" strokeWidth="1" />
        {/* 12 spokes */}
        {ZODIAC.map((_, i) => {
          const a = (i * 30 - 90) * (Math.PI / 180);
          return (
            <line
              key={`spoke-${i}`}
              x1={200 + 118 * Math.cos(a)} y1={200 + 118 * Math.sin(a)}
              x2={200 + 152 * Math.cos(a)} y2={200 + 152 * Math.sin(a)}
              stroke="#F59E0B" strokeOpacity="0.3" strokeWidth="1"
            />
          );
        })}
        {/* Glyphs */}
        {ZODIAC.map((g, i) => {
          const a = (i * 30 - 90) * (Math.PI / 180);
          return (
            <text
              key={`glyph-${i}`}
              x={200 + 135 * Math.cos(a)}
              y={200 + 135 * Math.sin(a)}
              fill="#FBBF24"
              fillOpacity="0.9"
              fontSize="21"
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily='"Segoe UI Symbol", "Noto Sans Symbols 2", "DejaVu Sans", serif'
            >
              {g}
            </text>
          );
        })}
      </g>

      {/* Tick ring (counter-rotates) */}
      <g className="zw-spin-med">
        {Array.from({ length: 72 }, (_, i) => {
          const a = (i * 5 - 90) * (Math.PI / 180);
          const long = i % 6 === 0;
          const r1 = long ? 100 : 106;
          return (
            <line
              key={`tick-${i}`}
              x1={200 + r1 * Math.cos(a)} y1={200 + r1 * Math.sin(a)}
              x2={200 + 112 * Math.cos(a)} y2={200 + 112 * Math.sin(a)}
              stroke="#FCD34D" strokeOpacity={long ? 0.55 : 0.3} strokeWidth={long ? 1.6 : 1}
            />
          );
        })}
        {/* Nakshatra-style dots (27) */}
        {Array.from({ length: 27 }, (_, i) => {
          const a = (i * (360 / 27) - 90) * (Math.PI / 180);
          return <circle key={`dot-${i}`} cx={200 + 96 * Math.cos(a)} cy={200 + 96 * Math.sin(a)} r="1.8" fill="#FCD34D" fillOpacity="0.5" />;
        })}
      </g>

      {/* Inner rings + sun */}
      <g className="zw-spin-slow-inner">
        <circle cx="200" cy="200" r="78" fill="none" stroke="url(#zw-gold)" strokeOpacity="0.45" strokeWidth="1.2" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 - 75) * (Math.PI / 180);
          return (
            <line
              key={`ray-${i}`}
              x1={200 + 34 * Math.cos(a)} y1={200 + 34 * Math.sin(a)}
              x2={200 + 74 * Math.cos(a)} y2={200 + 74 * Math.sin(a)}
              stroke="#FCD34D" strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round"
            />
          );
        })}
      </g>

      {/* Radiant sun core */}
      <g className="zw-sun">
        <circle cx="200" cy="200" r="64" fill="url(#zw-sun-glow)" />
        <circle cx="200" cy="200" r="17" fill="#FDE68A" />
        <circle cx="200" cy="200" r="17" fill="none" stroke="#F59E0B" strokeOpacity="0.6" strokeWidth="2" />
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i * 22.5 - 90) * (Math.PI / 180);
          const r2 = i % 2 === 0 ? 30 : 24;
          return (
            <line
              key={`sray-${i}`}
              x1={200 + 19 * Math.cos(a)} y1={200 + 19 * Math.sin(a)}
              x2={200 + r2 * Math.cos(a)} y2={200 + r2 * Math.sin(a)}
              stroke="#FCD34D" strokeOpacity="0.75" strokeWidth="2" strokeLinecap="round"
            />
          );
        })}
      </g>
    </svg>
  );

  if (ambient) {
    return (
      <div className={`zw-ambient ${className}`} aria-hidden="true">
        {starField}
        <div className="zw-ambient-wheel">{wheelSvg}</div>
      </div>
    );
  }

  return (
    <div
      className={`zodiac-wheel-stage ${className}`}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
      aria-hidden="true"
    >
      {starField}

      {/* Perspective stage with the tilted wheel */}
      <div className="zodiac-perspective">
        <div className="zodiac-tilt" style={tiltStyle}>
          {wheelSvg}
        </div>
      </div>
    </div>
  );
};
