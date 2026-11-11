"use client";

import React, { useState, useEffect } from "react";
import { IntakeProfile } from "@/lib/types";
import { searchCities } from "@/lib/api";
import {
  AlertTriangle, Calendar, Clock, MapPin,
  ShieldCheck, Sparkles
} from "lucide-react";

interface ReviewScreenProps {
  initialProfile: IntakeProfile;
  title?: string;
  onConfirm: (confirmedData: {
    name: string;
    gender: string;
    birth_date: string;
    birth_time: string;
    is_time_unknown: boolean;
    place_of_birth: string;
    latitude: number | null;
    longitude: number | null;
    iana_timezone: string;
    stated_rashi?: string;
    stated_nakshatra?: string;
    stated_gothra?: string;
  }) => void;
  onCancel?: () => void;
}

// Convert YYYY-MM-DD to English text ("4 June 1998")
function formatDateInWords(isoDate: string): string {
  try {
    if (!isoDate || !isoDate.includes("-")) return "";
    const parts = isoDate.split("-");
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return isoDate;
  }
}

// Format 24-hr time ("10:15") to 12-hr with AM/PM ("10:15 AM")
function formatTime12Hr(time24: string): string {
  if (!time24 || !time24.includes(":")) return "";
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr.padStart(2, "0");
  const meridiem = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m} ${meridiem}`;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  initialProfile,
  title = "Review Extracted Details",
  onConfirm,
  onCancel
}) => {
  const [name, setName] = useState(initialProfile.full_name.value || "");
  const [gender, setGender] = useState(initialProfile.gender.value || "Male");
  const [birthDate, setBirthDate] = useState(initialProfile.date_of_birth.value || "");
  const [birthTime, setBirthTime] = useState(initialProfile.time_of_birth.value || "");
  const [isTimeUnknown, setIsTimeUnknown] = useState(!initialProfile.time_of_birth.value);

  // Ambiguous date candidate choice if applicable
  const [selectedCandidate, setSelectedCandidate] = useState<string>(
    initialProfile.date_of_birth.value || ""
  );

  // Place of Birth states
  const [placeOfBirth, setPlaceOfBirth] = useState(initialProfile.place_of_birth.value || "");
  const [lat, setLat] = useState<number | null>(initialProfile.latitude ?? null);
  const [lon, setLon] = useState<number | null>(initialProfile.longitude ?? null);
  const [tz, setTz] = useState(initialProfile.iana_timezone || "Asia/Kolkata");
  const [continueWithoutPlace, setContinueWithoutPlace] = useState(false);

  // Stated attributes
  const [statedRashi] = useState(initialProfile.stated_rashi.value || "");
  const [statedNakshatra] = useState(initialProfile.stated_nakshatra.value || "");
  const [statedGothra] = useState(initialProfile.stated_gothra.value || "");

  // Autocomplete
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Auto-resolve city coordinates on mount if latitude is missing but place name exists
  useEffect(() => {
    if (lat === null && placeOfBirth && placeOfBirth.trim().length >= 2) {
      searchCities(placeOfBirth).then((res) => {
        if (res && res.length > 0) {
          setCitySuggestions(res);
          const exact = res.find((c: any) => 
            placeOfBirth.toLowerCase().includes(c.city.toLowerCase()) ||
            c.city.toLowerCase().includes(placeOfBirth.toLowerCase())
          ) || res[0];
          if (exact) {
            setLat(exact.latitude);
            setLon(exact.longitude);
            setTz(exact.iana_timezone);
          }
        }
      }).catch(() => {});
    }
  }, [placeOfBirth, lat]);

  const handleCitySearch = async (val: string) => {
    setPlaceOfBirth(val);
    if (val.trim().length >= 2) {
      try {
        const results = await searchCities(val);
        setCitySuggestions(results);
        setShowSuggestions(true);
      } catch {
        setCitySuggestions([]);
      }
    } else {
      setCitySuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectCity = (c: any) => {
    setPlaceOfBirth(c.display_name);
    setLat(c.latitude);
    setLon(c.longitude);
    setTz(c.iana_timezone);
    setShowSuggestions(false);
  };

  const handleConfirm = () => {
    let finalLat = lat;
    let finalLon = lon;
    let finalTz = tz;
    if (finalLat === null && citySuggestions.length > 0 && placeOfBirth) {
      const match = citySuggestions.find(c => 
        placeOfBirth.toLowerCase().includes(c.city.toLowerCase()) || 
        c.city.toLowerCase().includes(placeOfBirth.toLowerCase())
      );
      if (match) {
        finalLat = match.latitude;
        finalLon = match.longitude;
        finalTz = match.iana_timezone;
      }
    }

    onConfirm({
      name: name.trim() || "User",
      gender,
      birth_date: selectedCandidate || birthDate,
      birth_time: isTimeUnknown ? "" : birthTime,
      is_time_unknown: isTimeUnknown,
      place_of_birth: continueWithoutPlace ? "" : placeOfBirth,
      latitude: continueWithoutPlace ? null : finalLat,
      longitude: continueWithoutPlace ? null : finalLon,
      iana_timezone: finalTz,
      stated_rashi: statedRashi || undefined,
      stated_nakshatra: statedNakshatra || undefined,
      stated_gothra: statedGothra || undefined
    });
  };

  const isDobLowConfidence = initialProfile.date_of_birth.confidence < 0.8 || initialProfile.date_of_birth.is_ambiguous;
  const isTobLowConfidence = !isTimeUnknown && initialProfile.time_of_birth.confidence < 0.8;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xl overflow-hidden p-6 sm:p-7 max-w-xl mx-auto transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-6">
        <div>
          <h2 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2 font-serif-vedic">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>{title}</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Nothing is calculated until you review and confirm. Fields under 80% confidence require verification.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Full Name & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Full Name
              </label>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                initialProfile.full_name.confidence >= 0.8
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
              }`}>
                {(initialProfile.full_name.confidence * 100).toFixed(0)}% Confidence
              </span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-amber-500/30 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1.5">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-amber-500/30 outline-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Date of Birth with Words representation & Ambiguity resolution */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDobLowConfidence
            ? "border-amber-400 bg-amber-500/10 dark:bg-amber-950/20"
            : "border-stone-200 dark:border-stone-700 bg-stone-50/40 dark:bg-stone-800/30"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Date of Birth</span>
            </label>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
              !isDobLowConfidence
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30"
            }`}>
              {isDobLowConfidence ? "Needs Confirmation" : `${(initialProfile.date_of_birth.confidence * 100).toFixed(0)}% Confident`}
            </span>
          </div>

          {/* Ambiguity Alert */}
          {initialProfile.date_of_birth.is_ambiguous && initialProfile.date_of_birth.candidates && (
            <div className="mb-3.5 p-3 bg-amber-100/70 dark:bg-amber-950/40 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2 border border-amber-300 dark:border-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Date format is ambiguous (DD-MM vs MM-DD):</span>
                Source says <code className="bg-amber-200/60 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono font-bold">{initialProfile.date_of_birth.source_text}</code>.
                We defaulted to DD-MM (Indian standard). Please choose the intended date:
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {initialProfile.date_of_birth.candidates.map((cand, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedCandidate(cand);
                        setBirthDate(cand);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        (selectedCandidate || birthDate) === cand
                          ? "bg-amber-600 text-white border-amber-600 shadow-md"
                          : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:border-amber-400"
                      }`}
                    >
                      {formatDateInWords(cand)} ({idx === 0 ? "DD-MM" : "MM-DD"})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <input
              type="date"
              value={selectedCandidate || birthDate}
              onChange={(e) => {
                setSelectedCandidate(e.target.value);
                setBirthDate(e.target.value);
              }}
              className="px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/30 shadow-sm"
            />
            <div className="text-xs text-stone-600 dark:text-stone-400 bg-white dark:bg-stone-800 p-3 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm">
              <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Date in words:</span>
              <span className="font-extrabold text-amber-700 dark:text-amber-400 text-xs sm:text-sm">
                {formatDateInWords(selectedCandidate || birthDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Time of Birth */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isTobLowConfidence
            ? "border-amber-400 bg-amber-500/10 dark:bg-amber-950/20"
            : "border-stone-200 dark:border-stone-700 bg-stone-50/40 dark:bg-stone-800/30"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Time of Birth</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 cursor-pointer font-medium hover:text-amber-600">
              <input
                type="checkbox"
                checked={isTimeUnknown}
                onChange={(e) => setIsTimeUnknown(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
              />
              <span>Time Unknown</span>
            </label>
          </div>

          {!isTimeUnknown ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/30 shadow-sm"
              />
              <div className="text-xs text-stone-600 dark:text-stone-400 bg-white dark:bg-stone-800 p-3 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm">
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">12 hour format:</span>
                <span className="font-extrabold text-amber-700 dark:text-amber-400 text-xs sm:text-sm">
                  {formatTime12Hr(birthTime) || "Not Set"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-amber-700 dark:text-amber-400 italic leading-relaxed">
              Ascendant (Lagna) and houses will be omitted. Calculations will use Solar Noon Chandra Kundali.
            </div>
          )}
        </div>

        {/* Place of Birth */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Place of Birth</span>
            </label>
            <button
              type="button"
              onClick={() => setContinueWithoutPlace(!continueWithoutPlace)}
              className="text-[11px] text-amber-600 dark:text-amber-400 hover:text-amber-700 font-bold underline"
            >
              {continueWithoutPlace ? "Enter Place of Birth" : "Continue without place"}
            </button>
          </div>

          {!continueWithoutPlace ? (
            <>
              <input
                type="text"
                value={placeOfBirth}
                onChange={(e) => handleCitySearch(e.target.value)}
                placeholder="Type city name (e.g. Bengaluru, Mumbai, Chennai)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500/30 outline-none shadow-sm"
              />
              {showSuggestions && citySuggestions.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 max-h-48 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-700/50">
                  {citySuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectCity(item)}
                      className="px-3.5 py-2.5 cursor-pointer hover:bg-amber-50/60 dark:hover:bg-stone-700 text-xs transition-colors"
                    >
                      <div className="font-bold text-stone-900 dark:text-stone-100">{item.city}</div>
                      <div className="text-[10px] text-stone-500">
                        {item.country} • Lat: {item.latitude.toFixed(2)}°, Lon: {item.longitude.toFixed(2)}°
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="p-3 bg-amber-500/10 dark:bg-stone-800 rounded-xl text-xs text-amber-700 dark:text-amber-400 border border-amber-500/30 dark:border-stone-700">
              Generating Moon-based results only (Rashi, Nakshatra, Ashtakoota, Dasha). Rising sign (Lagna) and houses will be excluded.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-xl border border-stone-200 dark:border-stone-700 font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm transition-all shadow-sm active:scale-95"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-2 w-full py-3.5 px-5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold rounded-xl shadow-lg shadow-amber-600/25 transition-all flex items-center justify-center gap-2 text-sm active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Confirm &amp; Generate Kundali</span>
          </button>
        </div>
      </div>
    </div>
  );
};
