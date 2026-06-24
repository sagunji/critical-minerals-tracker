import { useMemo } from "react";
import { MINERAL_COLORS, STAGE_OPTIONS } from "../types";
import type { MineralProject } from "../types";

interface FilterPanelProps {
  projects: MineralProject[];
  selectedMinerals: string[];
  selectedStage: string;
  selectedProvince: string;
  selectedRegion: string;
  selectedOperator: string;
  showFundedOnly: boolean;
  searchQuery: string;
  onMineralToggle: (mineral: string) => void;
  onStageChange: (stage: string) => void;
  onProvinceChange: (province: string) => void;
  onRegionChange: (region: string) => void;
  onOperatorChange: (operator: string) => void;
  onFundedToggle: () => void;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  projectCount: number;
  totalCount: number;
}

const inputClass =
  "w-full px-3 py-1.5 text-sm border border-border rounded-md bg-bg-card focus:outline-none focus:ring-1 focus:ring-accent";

export default function FilterPanel({
  projects,
  selectedMinerals,
  selectedStage,
  selectedProvince,
  selectedRegion,
  selectedOperator,
  showFundedOnly,
  searchQuery,
  onMineralToggle,
  onStageChange,
  onProvinceChange,
  onRegionChange,
  onOperatorChange,
  onFundedToggle,
  onSearchChange,
  onReset,
  projectCount,
  totalCount,
}: FilterPanelProps) {
  const hasFilters =
    selectedMinerals.length > 0 ||
    selectedStage !== "All Stages" ||
    selectedProvince !== "All Provinces" ||
    selectedRegion !== "All Regions" ||
    selectedOperator !== "All Operators" ||
    showFundedOnly ||
    searchQuery !== "";

  const provinces = useMemo(() => {
    const unique = [...new Set(projects.map((p) => p.province))].sort();
    return ["All Provinces", ...unique];
  }, [projects]);

  const regions = useMemo(() => {
    const unique = [...new Set(projects.map((p) => p.region))].sort();
    return ["All Regions", ...unique];
  }, [projects]);

  const operators = useMemo(() => {
    const unique = [...new Set(projects.map((p) => p.operator))].sort();
    return ["All Operators", ...unique];
  }, [projects]);

  const mineralCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      for (const [key] of Object.entries(MINERAL_COLORS)) {
        if (key === "Other") continue;
        if (
          p.primaryMineral.toLowerCase().includes(key.toLowerCase()) ||
          p.minerals.some((m) => m.toLowerCase().includes(key.toLowerCase()))
        ) {
          counts[key] = (counts[key] || 0) + 1;
        }
      }
    });
    return counts;
  }, [projects]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold">Filters</h3>
        {hasFilters && (
          <button
            className="text-xs text-accent hover:text-accent-hover font-medium"
            onClick={onReset}
          >
            Reset all
          </button>
        )}
      </div>

      <div className="text-xs text-text-muted pb-3 border-b border-border">
        Showing <strong className="text-text">{projectCount}</strong> of {totalCount} projects
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
          Search
        </label>
        <input
          type="text"
          className={inputClass}
          placeholder="Project, operator, or region..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
          Development Stage
        </label>
        <select
          className={inputClass}
          value={selectedStage}
          onChange={(e) => onStageChange(e.target.value)}
        >
          {STAGE_OPTIONS.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
          Province / Territory
        </label>
        <select
          className={inputClass}
          value={selectedProvince}
          onChange={(e) => onProvinceChange(e.target.value)}
        >
          {provinces.map((prov) => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
          Region
        </label>
        <select
          className={inputClass}
          value={selectedRegion}
          onChange={(e) => onRegionChange(e.target.value)}
        >
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
          Operator
        </label>
        <select
          className={inputClass}
          value={selectedOperator}
          onChange={(e) => onOperatorChange(e.target.value)}
        >
          {operators.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
          Quick Filters
        </label>
        <label
          className={`flex items-center gap-2 text-sm cursor-pointer px-3 py-1.5 rounded-md border transition-colors ${
            showFundedOnly
              ? "border-accent bg-bg-muted"
              : "border-border bg-bg-muted"
          }`}
        >
          <input
            type="checkbox"
            className="accent-accent"
            checked={showFundedOnly}
            onChange={onFundedToggle}
          />
          <span>🏛️ Government funded</span>
        </label>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
          Mineral Type
        </label>
        <div className="space-y-1">
          {Object.entries(MINERAL_COLORS)
            .filter(([key]) => key !== "Other")
            .map(([mineral, color]) => {
              const checked = selectedMinerals.includes(mineral);
              return (
                <label
                  key={mineral}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="accent-accent"
                    checked={checked}
                    onChange={() => onMineralToggle(mineral)}
                  />
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-opacity ${
                      checked ? "opacity-100" : "opacity-50"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                  <span>{mineral}</span>
                  <span className="ml-auto text-xs text-text-muted">
                    {mineralCounts[mineral] || 0}
                  </span>
                </label>
              );
            })}
        </div>
      </div>
    </div>
  );
}
