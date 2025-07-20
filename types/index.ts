// Comprehensive type definitions for the entire app
export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  is_donor: boolean;
  created_at: string;
}

export interface ProfileData {
  birthInfo: BirthInfo;
  planetaryPositions: PlanetPosition[];
  houses: Record<number, string[]>;
  vimshottariDasha: DashaPeriod[];
  nakshatra: Nakshatra;
  coreElements: Record<string, number>;
  divisionalCharts: Record<string, Record<string, number>>;
  yogas: YogaData;
  shadbala: Record<string, number>;
  bhavaBala: Record<string, number>;
  analysis: ProfileAnalysis;
}

export interface BirthInfo {
  date: string;
  time: string;
  location: string;
  latitude: number;
  longitude: number;
  timezone: string;
  ascendant_sign?: string;
}

export interface PlanetPosition {
  name: string;
  sign: string;
  degree: number;
  retrograde: boolean;
  nakshatra?: string;
  house?: number;
}

export interface DashaPeriod {
  lord: string;
  start: string;
  end: string;
  level: number;
  sub?: DashaPeriod[];
}

export interface Nakshatra {
  nakshatra: string;
  pada: number;
  lord: string;
  deity: string;
  symbol: string;
  description: string;
}

export interface YogaData {
  wealth_yogas: Yoga[];
  raj_yogas: Yoga[];
  spiritual_yogas: Yoga[];
  relationship_yogas: Yoga[];
  health_yogas: Yoga[];
  total_count: number;
  summary: string[];
}

export interface Yoga {
  name: string;
  type: string;
  description: string;
  strength: 'strong' | 'moderate' | 'weak';
  planets: string[];
}

export interface ProfileAnalysis {
  nakshatra: NakshatraAnalysis;
  houses: Record<string, string>;
  coreElements: Record<string, string>;
  vimshottariDasha: DashaAnalysis[];
  divisionalCharts: Record<string, ChartAnalysis>;
  yogas: Record<string, YogaAnalysis[]>;
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  published: boolean;
  featured: boolean;
  tags?: string;
  created_at: string;
  updated_at: string;
  owner: string;
  read_time?: number;
  cover_image?: string;
}