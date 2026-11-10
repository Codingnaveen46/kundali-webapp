/**
 * TypeScript interface definitions for Kundli
 */

export interface PlanetPosition {
  name: string;
  longitude: number;
  sign: string;
  sign_sanskrit: string;
  sign_idx: number;
  degree_in_sign: number;
  minute_in_sign: number;
  second_in_sign: number;
  total_deg_in_sign: number;
  nakshatra: string;
  nakshatra_idx: number;
  nakshatra_lord: string;
  pada: number;
  nakshatra_elapsed_deg: number;
  speed: number;
  is_retrograde: boolean;
  is_combust: boolean;
  house?: number;
  is_relative_to_moon?: boolean;
  navamsa_sign?: string;
  navamsa_sign_sanskrit?: string;
  navamsa_sign_idx?: number;
  navamsa_house?: number;
}

export interface LagnaInfo {
  longitude: number;
  sign: string;
  sign_sanskrit: string;
  sign_idx: number;
  degree_in_sign: number;
  minute_in_sign: number;
  second_in_sign: number;
  total_deg_in_sign: number;
  dms_in_sign?: string;
  total_dms?: string;
  nakshatra: string;
  nakshatra_idx: number;
  pada: number;
  navamsa_sign: string;
  navamsa_sign_sanskrit: string;
  navamsa_sign_idx: number;
  houses: Array<{
    house_number: number;
    sign: string;
    sign_sanskrit: string;
    sign_idx: number;
    cusp_longitude: number;
    deg_in_sign: number;
  }>;
}

export interface PanchangInfo {
  tithi: {
    number: number;
    paksha: string;
    paksha_tithi_num: number;
    name: string;
    full_name: string;
    elapsed_percent: number;
    remaining_percent: number;
  };
  vara: {
    name: string;
    sanskrit: string;
    number: number;
  };
  nakshatra: {
    name: string;
    number: number;
    elapsed_percent: number;
    remaining_percent: number;
  };
  yoga: {
    number: number;
    name: string;
    elapsed_percent: number;
    remaining_percent: number;
  };
  karana: {
    number: number;
    name: string;
    is_vishti: boolean;
    elapsed_percent: number;
    remaining_percent: number;
  };
}

export interface DashaPeriod {
  lord: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface AntardashaPeriod extends DashaPeriod {
  pratyantardashas: DashaPeriod[];
}

export interface MahadashaPeriod extends DashaPeriod {
  total_years: number;
  antardashas: AntardashaPeriod[];
}

export interface DashaInfo {
  balance_at_birth: {
    lord: string;
    total_years?: number;
    balance_years: number;
    balance_days: number;
    fraction_remaining: number;
    percentage_remaining?: number;
    working_str?: string;
  };
  current_period: {
    mahadasha: string | null;
    antardasha: string | null;
    pratyantardasha: string | null;
    as_of_date: string;
  };
  mahadashas: MahadashaPeriod[];
}

export interface AvakahadaInfo {
  rashi: string;
  rashi_sanskrit: string;
  rashi_lord: string;
  nakshatra: string;
  nakshatra_number: number;
  pada: number;
  varna: string;
  vashya: string;
  tara: string;
  yoni: string;
  yoni_gender: string;
  gana: string;
  nadi: string;
  tatwa: string;
  paya?: {
    house_from_lagna: number;
    paya: string;
    result: string;
  } | null;
}

export interface DoshaEvaluation {
  mangal_dosha: {
    is_present: boolean;
    is_raw_present: boolean;
    is_cancelled: boolean;
    severity: string;
    status: string;
    mars_sign: string;
    mars_house_lagna: number | null;
    mars_house_moon: number;
    mars_house_venus: number;
    afflicted_from: {
      lagna: boolean;
      moon: boolean;
      venus: boolean;
    };
    cancellations: Array<{ rule: string; citation: string; desc: string }>;
  };
  kaal_sarpa: {
    is_present: boolean;
    is_purna: boolean;
    is_khanda: boolean;
    intensity: string;
    direction: string | null;
    rahu_house: number | null;
    yoga_name: string;
    description: string;
  };
  sade_sati: {
    is_active: boolean;
    phase: string;
    description: string;
    current_saturn_sign: string;
    current_saturn_sign_sanskrit: string;
    is_ashtama_shani: boolean;
    is_ardhastama_shani: boolean;
    counsel: string;
  };
}

export interface BoundaryAlert {
  target: string;
  type: string;
  severity: string;
  current_position: string;
  distance_to_boundary: number;
  boundary: string;
  message: string;
}

export interface PlanetTableRow {
  planet: string;
  sign: string;
  sign_sanskrit?: string;
  house: number | string;
  deg_in_sign: string;
  total_dms?: string;
  nakshatra: string;
  pada: number;
  navamsa_sign: string;
  navamsa_sign_idx?: number;
  is_retrograde: boolean;
  is_combust: boolean;
  is_vargottama: boolean;
  dignity: string;
}

export interface BirthChartResponse {
  metadata: {
    name: string;
    gender?: string;
    birth_date: string;
    birth_time: string;
    is_time_unknown: boolean;
    is_place_unknown: boolean;
    latitude: number;
    longitude: number;
    timezone: string;
    ayanamsa: string;
    ayanamsa_dms?: string;
    node_type?: string;
    node_type_note?: string;
    methodology_version?: string;
    house_system: string;
    julian_day: number;
    generated_at: string;
  };
  lagna: LagnaInfo | null;
  lagna_vargottama?: boolean;
  planets_table?: PlanetTableRow[];
  planets: Record<string, PlanetPosition>;
  panchang: PanchangInfo;
  dasha: DashaInfo;
  avakahada: AvakahadaInfo;
  doshas: DoshaEvaluation;
  boundary_warnings: {
    has_warnings: boolean;
    has_critical_warning: boolean;
    count: number;
    warnings: BoundaryAlert[];
  };
  unknown_metadata: Record<string, any>;
  calculation_appendix?: Record<string, any>;
  nakshatra_working?: Record<string, any>;
}

export interface KootaScore {
  koota: string;
  points: number;
  raw_points?: number;
  effective_points?: number;
  max_points: number;
  groom_value: string;
  bride_value: string;
  status: string;
  description: string;
  has_dosha?: boolean;
  is_cancelled?: boolean;
  cancellation_rule?: string | null;
  cancellation_source?: string | null;
  cancellation_note?: string | null;
  cancellations?: string[];
  school_used?: string;
  citation: string;
  working?: Record<string, any>;
  alternate_option?: Record<string, any> | null;
  has_school_difference?: boolean;
  groom_gender?: string;
  bride_gender?: string;
  gender_status?: string;
}

export interface AshtakootaResult {
  total_points: number;
  raw_total_points: number;
  effective_total_points: number;
  max_points: number;
  percentage: number;
  raw_percentage: number;
  effective_percentage: number;
  min_score_threshold: number;
  is_compatible: boolean;
  verdict: string;
  summary: string;
  cancellations_applied?: boolean;
  active_doshas: string[];
  kootas: KootaScore[];
  alternate_vashya_total?: number | null;
  vashya_difference_note?: string | null;
  vashya_capricorn?: string;
  has_vashya_diff?: boolean;
  rules_producing_difference?: any[];
}

export interface PoruthamResult {
  name: string;
  kannada_name?: string;
  dimension: string;
  is_compatible: boolean;
  status: string;
  result?: string;
  rating: string;
  count?: number;
  remainder?: number;
  count_or_distance?: string;
  count_distance_str?: string;
  rule?: string;
  rule_condition?: string;
  source?: string;
  citation?: string;
  explanation: string;
  working?: Record<string, any>;
  gender_status?: string;
}

export interface DasaKootaResult {
  poruthams_matched: number;
  pass_count?: number;
  fail_count?: number;
  conditional_count?: number;
  passed_poruthams_count?: number;
  failed_poruthams_count?: number;
  conditional_poruthams_count?: number;
  total_poruthams: number;
  rajju_matched: boolean;
  vedha_matched: boolean;
  failed_names?: string[];
  passed_names?: string[];
  conditional_names?: string[];
  summary: string;
  section_label?: string;
  is_experimental?: boolean;
  disclaimer?: string;
  poruthams: PoruthamResult[];
}

export interface DoshaSamyaDecisionRow {
  case_id: string;
  title: string;
  meaning: string;
  is_active: boolean;
}

export interface DoshaSamyaResult {
  groom_points: number;
  bride_points: number;
  case_id?: string;
  case_title?: string;
  case_meaning?: string;
  decision_table?: DoshaSamyaDecisionRow[];
  is_balanced: boolean;
  verdict: string;
  explanation: string;
}

export interface MarriageMatchResponse {
  groom_summary: Record<string, any>;
  bride_summary: Record<string, any>;
  ashtakoota: AshtakootaResult;
  dasa_koota: DasaKootaResult;
  dosha_samya: DoshaSamyaResult;
  dosha_review?: Record<string, any>;
  objections_noted?: string[];
  vashya_capricorn?: string;
  calculation_appendix?: {
    groom: Record<string, any>;
    bride: Record<string, any>;
  };
  boundary_alerts: {
    groom: { has_warnings: boolean; warnings: BoundaryAlert[] };
    bride: { has_warnings: boolean; warnings: BoundaryAlert[] };
  };
  astrologer_details?: Record<string, any>;
  groom_chart: BirthChartResponse;
  bride_chart: BirthChartResponse;
}

export interface ExtractedField {
  value: string | null;
  confidence: number;
  source_text: string | null;
  is_ambiguous?: boolean;
  candidates?: string[] | null;
  needs_confirmation?: boolean;
}

export interface IntakeProfile {
  full_name: ExtractedField;
  gender: ExtractedField;
  date_of_birth: ExtractedField;
  time_of_birth: ExtractedField;
  place_of_birth: ExtractedField;
  latitude?: number | null;
  longitude?: number | null;
  iana_timezone?: string | null;
  stated_rashi: ExtractedField;
  stated_nakshatra: ExtractedField;
  stated_gothra: ExtractedField;
  warnings: string[];
}

export interface ExtractionResponse {
  status: string;
  is_dual_profile: boolean;
  primary_profile: IntakeProfile;
  secondary_profile?: IntakeProfile | null;
  extraction_notes: string[];
}

export interface AIExplanationData {
  summary: string;
  strengths: string[];
  concerns: string[];
  questions_for_astrologer: string[];
}

export interface AIExplanationResponse {
  is_available: boolean;
  disclaimer: string;
  explanation?: AIExplanationData;
  error?: string;
  fallback_to_deterministic?: boolean;
  anonymized_payload_sent?: Record<string, any>;
}
