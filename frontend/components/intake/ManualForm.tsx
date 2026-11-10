"use client";

import React, { useState, useEffect } from "react";
import { searchCities } from "@/lib/api";
import { MapPin, Clock, Calendar, User, Search, Sparkles } from "lucide-react";

export interface ManualFormData {
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
}

interface ManualFormProps {
  initialData?: Partial<ManualFormData>;
  onSubmit: (data: ManualFormData) => void;
  submitLabel?: string;
}

export const ManualForm: React.FC<ManualFormProps> = ({
  initialData,
  onSubmit,
  submitLabel = "Review & Generate"
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [gender, setGender] = useState(initialData?.gender || "Male");
  const [birthDate, setBirthDate] = useState(initialData?.birth_date || "1994-08-15");
  
  // 12-hour time states
  const [hour12, setHour12] = useState("06");
  const [minute, setMinute] = useState("45");
  const [meridiem, setMeridiem] = useState<"AM" | "PM">("AM");
  const [isTimeUnknown, setIsTimeUnknown] = useState(initialData?.is_time_unknown || false);

  // Place & Autocomplete states
  const [pob, setPob] = useState(initialData?.place_of_birth || "Bengaluru");
  const [lat, setLat] = useState<number | null>(initialData?.latitude ?? 12.9716);
  const [lon, setLon] = useState<number | null>(initialData?.longitude ?? 77.5946);
  const [tz, setTz] = useState(initialData?.iana_timezone || "Asia/Kolkata");
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Parse initial 24-hr time if provided
  useEffect(() => {
    if (initialData?.birth_time && initialData.birth_time.includes(":")) {
      const [hStr, mStr] = initialData.birth_time.split(":");
      const h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      setMinute(String(m).padStart(2, "0"));
      if (h >= 12) {
        setMeridiem("PM");
        setHour12(String(h === 12 ? 12 : h - 12).padStart(2, "0"));
      } else {
        setMeridiem("AM");
        setHour12(String(h === 0 ? 12 : h).padStart(2, "0"));
      }
    }
  }, [initialData?.birth_time]);

  // City autocomplete handler
  const handlePobChange = async (val: string) => {
    setPob(val);
    if (val.trim().length >= 2) {
      setIsSearchingCities(true);
      setShowSuggestions(true);
      try {
        const results = await searchCities(val);
        setCitySuggestions(results);
      } catch {
        setCitySuggestions([]);
      } finally {
        setIsSearchingCities(false);
      }
    } else {
      setCitySuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectCity = (city: any) => {
    setPob(city.display_name);
    setLat(city.latitude);
    setLon(city.longitude);
    setTz(city.iana_timezone);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let time24 = "";
    if (!isTimeUnknown) {
      let h = parseInt(hour12, 10);
      if (meridiem === "PM" && h < 12) h += 12;
      if (meridiem === "AM" && h === 12) h = 0;
      time24 = `${String(h).padStart(2, "0")}:${minute}`;
    }

    let submitLat = lat;
    let submitLon = lon;
    let submitTz = tz;
    const cleanPob = pob.trim().toLowerCase();
    if (citySuggestions.length > 0) {
      const match = citySuggestions.find(c => 
        cleanPob === c.city.toLowerCase() || 
        c.city.toLowerCase().startsWith(cleanPob) ||
        cleanPob.includes(c.city.toLowerCase())
      );
      if (match) {
        submitLat = match.latitude;
        submitLon = match.longitude;
        submitTz = match.iana_timezone;
      }
    } else if (cleanPob && !cleanPob.includes("bengaluru") && !cleanPob.includes("bangalore") && submitLat === 12.9716 && submitLon === 77.5946) {
      // User typed a non-Bangalore city but did not pick from dropdown; let backend geocode
      submitLat = null;
      submitLon = null;
    }

    onSubmit({
      name: name.trim() || "User",
      gender,
      birth_date: birthDate,
      birth_time: isTimeUnknown ? "" : time24,
      is_time_unknown: isTimeUnknown,
      place_of_birth: pob.trim(),
      latitude: submitLat,
      longitude: submitLon,
      iana_timezone: submitTz,
      stated_rashi: initialData?.stated_rashi,
      stated_nakshatra: initialData?.stated_nakshatra,
      stated_gothra: initialData?.stated_gothra
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
      {/* Full Name & Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5 text-xs">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arun Kumar"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition-all shadow-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5 text-xs">
            Gender
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition-all shadow-sm font-medium"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5 text-xs">
          Date of Birth
        </label>
        <div className="relative">
          <Calendar className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition-all shadow-sm font-medium"
            required
          />
        </div>
      </div>

      {/* Time of Birth (12-hour format with AM/PM + Unknown toggle) */}
      <div className="p-3.5 bg-amber-500/5 dark:bg-stone-800/40 rounded-2xl border border-amber-500/20 dark:border-stone-700/80">
        <div className="flex items-center justify-between mb-2.5">
          <label className="font-bold text-xs text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Time of Birth (12-Hour)</span>
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
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Hour</span>
              <select
                value={hour12}
                onChange={(e) => setHour12(e.target.value)}
                className="w-full py-2 px-2 text-center rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500/30 outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Minute</span>
              <select
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="w-full py-2 px-2 text-center rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500/30 outline-none"
              >
                {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">AM / PM</span>
              <div className="flex bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-0.5">
                <button
                  type="button"
                  onClick={() => setMeridiem("AM")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    meridiem === "AM"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setMeridiem("PM")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    meridiem === "PM"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-amber-700 dark:text-amber-400 italic py-1 leading-relaxed">
            Moon-based results only (Chandra Lagna, Nakshatra, Ashtakoota, Dasha). Rising sign (Lagna) and houses will be omitted.
          </p>
        )}
      </div>

      {/* Place of Birth Autocomplete */}
      <div className="relative">
        <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5 text-xs">
          Place of Birth
        </label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={pob}
            onChange={(e) => handlePobChange(e.target.value)}
            placeholder="Type city name (e.g. Bengaluru, Mumbai, Chennai)..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition-all shadow-sm font-medium"
            onFocus={() => {
              if (citySuggestions.length > 0) setShowSuggestions(true);
            }}
          />
          {isSearchingCities && (
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-amber-500 animate-spin" />
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {showSuggestions && citySuggestions.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 max-h-52 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-700/50">
            {citySuggestions.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectCity(item)}
                className="px-3.5 py-2.5 cursor-pointer hover:bg-amber-50/60 dark:hover:bg-stone-700/60 text-xs transition-colors"
              >
                <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                  <span>{item.city}</span>
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold">{item.iana_timezone}</span>
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  {item.state ? `${item.state}, ` : ""}{item.country} • Lat: {item.latitude.toFixed(2)}°, Lon: {item.longitude.toFixed(2)}°
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2 text-sm active:scale-98"
      >
        <Sparkles className="w-4 h-4" />
        <span>{submitLabel}</span>
      </button>
    </form>
  );
};
