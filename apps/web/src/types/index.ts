export interface FundingRecord {
  program: string;
  amount: number | null;
  year: number | null;
  purpose: string | null;
}

export interface MineralProject {
  id: string;
  name: string;
  operator: string;
  minerals: string[];
  primaryMineral: string;
  stage: string;
  status: string;
  latitude: number;
  longitude: number;
  region: string;
  province: string;
  website: string | null;
  source: string;
  nrcanObjectId: number | null;
  funding?: FundingRecord[];
}

export type MineralCategory =
  | "Nickel"
  | "Copper"
  | "Lithium"
  | "Platinum"
  | "Palladium"
  | "Cobalt"
  | "Graphite"
  | "Chromite"
  | "Rare Earths"
  | "Other";

export const MINERAL_COLORS: Record<string, string> = {
  Nickel: "#4CAF50",
  Copper: "#FF7043",
  Lithium: "#7C4DFF",
  Platinum: "#78909C",
  Palladium: "#26A69A",
  Cobalt: "#42A5F5",
  Graphite: "#455A64",
  Chromite: "#8D6E63",
  "Rare Earths": "#AB47BC",
  Other: "#9E9E9E",
};

export const STAGE_OPTIONS = [
  "All Stages",
  "Producing Mine",
  "Advanced Project",
  "Advanced Processing Project",
  "Processing Facility",
];

export function getMineralColor(mineral: string): string {
  for (const [key, color] of Object.entries(MINERAL_COLORS)) {
    if (mineral.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }
  return MINERAL_COLORS.Other;
}

export function formatCurrency(amount: number | null): string {
  if (!amount) return "N/A";
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(0)}M`;
  }
  return `$${amount.toLocaleString()}`;
}
