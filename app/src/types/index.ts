export interface ProjectTimeline {
  currentPhase: number;
  phases: {
    label: string;
    date?: string;
    status: "completed" | "active" | "upcoming";
  }[];
}

export interface FundingRecord {
  program: string;
  amount: number;
  projectName: string;
  intake: number;
}

export interface MineralProject {
  id: string;
  name: string;
  operator: string;
  ownership: string;
  minerals: string[];
  primaryMineral: string;
  stage: string;
  status: string;
  latitude: number;
  longitude: number;
  region: string;
  district: string;
  province: string;
  description: string;
  investmentCAD: number | null;
  resourceTonnes: number | null;
  annualProductionTarget: string | null;
  website: string | null;
  source: string;
  supplyChainId: string | null;
  timeline?: ProjectTimeline;
  funding?: FundingRecord[];
}

export interface SupplyChainStep {
  step: number;
  stage: string;
  entity: string;
  location: string;
  output: string;
  description: string;
}

export interface SupplyChain {
  id: string;
  projectId: string;
  projectName: string;
  chain: SupplyChainStep[];
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
