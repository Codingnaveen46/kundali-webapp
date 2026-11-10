/**
 * API client to communicate with the FastAPI backend
 */

import { BirthChartResponse, MarriageMatchResponse, ExtractionResponse, AIExplanationResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchBirthChart(params: {
  name: string;
  gender?: string;
  birth_date: string;
  birth_time?: string;
  is_time_unknown?: boolean;
  place_of_birth?: string;
  latitude?: number;
  longitude?: number;
  iana_timezone?: string;
  ayanamsa?: string;
  house_system?: string;
  node_type?: string;
}): Promise<BirthChartResponse> {
  const res = await fetch(`${API_BASE_URL}/api/birth-chart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Network request failed" }));
    throw new Error(errorData.detail || `Server error: ${res.status}`);
  }

  return res.json();
}

export async function fetchMarriageMatch(params: {
  groom: {
    name: string;
    gender?: string;
    birth_date: string;
    birth_time?: string;
    is_time_unknown?: boolean;
    latitude?: number;
    longitude?: number;
    iana_timezone?: string;
    node_type?: string;
  };
  bride: {
    name: string;
    gender?: string;
    birth_date: string;
    birth_time?: string;
    is_time_unknown?: boolean;
    latitude?: number;
    longitude?: number;
    iana_timezone?: string;
    node_type?: string;
  };
  vashya_school?: string;
  gana_school?: string;
  min_score_threshold?: number;
  node_type?: string;
}): Promise<MarriageMatchResponse> {
  const res = await fetch(`${API_BASE_URL}/api/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Network request failed" }));
    throw new Error(errorData.detail || `Server error: ${res.status}`);
  }

  return res.json();
}

export async function extractFromText(text: string): Promise<ExtractionResponse> {
  const res = await fetch(`${API_BASE_URL}/api/intake/extract-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Text extraction failed" }));
    throw new Error(errorData.detail || `Server error: ${res.status}`);
  }

  return res.json();
}

export async function searchCities(query: string) {
  if (!query || query.trim().length === 0) return [];
  const res = await fetch(`${API_BASE_URL}/api/geocode?q=${encodeURIComponent(query)}&limit=8`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchAIExplanation(
  matchResult: any,
  optIn: boolean,
  language: string = "en",
  modelOverride?: string
): Promise<AIExplanationResponse> {
  const res = await fetch(`${API_BASE_URL}/api/match/ai-explanation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      match_result: matchResult,
      opt_in: optIn,
      language,
      model_override: modelOverride,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "AI Explanation failed" }));
    throw new Error(errorData.detail || `Server error: ${res.status}`);
  }

  return res.json();
}
