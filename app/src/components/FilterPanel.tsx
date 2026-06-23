import { useMemo } from "react";
import { MINERAL_COLORS, STAGE_OPTIONS } from "../types";
import type { MineralProject } from "../types";

interface FilterPanelProps {
  projects: MineralProject[];
  selectedMinerals: string[];
  selectedStage: string;
  selectedRegion: string;
  selectedOperator: string;
  showFundedOnly: boolean;
  showSupplyChainOnly: boolean;
  searchQuery: string;
  onMineralToggle: (mineral: string) => void;
  onStageChange: (stage: string) => void;
  onRegionChange: (region: string) => void;
  onOperatorChange: (operator: string) => void;
  onFundedToggle: () => void;
  onSupplyChainToggle: () => void;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  projectCount: number;
  totalCount: number;
}

export default function FilterPanel({
  projects,
  selectedMinerals,
  selectedStage,
  selectedRegion,
  selectedOperator,
  showFundedOnly,
  showSupplyChainOnly,
  searchQuery,
  onMineralToggle,
  onStageChange,
  onRegionChange,
  onOperatorChange,
  onFundedToggle,
  onSupplyChainToggle,
  onSearchChange,
  onReset,
  projectCount,
  totalCount,
}: FilterPanelProps) {
  const hasFilters =
    selectedMinerals.length > 0 ||
    selectedStage !== "All Stages" ||
    selectedRegion !== "All Regions" ||
    selectedOperator !== "All Operators" ||
    showFundedOnly ||
    showSupplyChainOnly ||
    searchQuery !== "";

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
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        {hasFilters && (
          <button className="reset-btn" onClick={onReset}>
            Reset all
          </button>
        )}
      </div>

      <div className="filter-count">
        Showing <strong>{projectCount}</strong> of {totalCount} projects
      </div>

      <div className="filter-section">
        <label className="filter-label">Search</label>
        <input
          type="text"
          className="filter-input"
          placeholder="Project, operator, or region..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="filter-section">
        <label className="filter-label">Development Stage</label>
        <select
          className="filter-select"
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

      <div className="filter-section">
        <label className="filter-label">Region</label>
        <select
          className="filter-select"
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

      <div className="filter-section">
        <label className="filter-label">Operator</label>
        <select
          className="filter-select"
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

      <div className="filter-section">
        <label className="filter-label">Quick Filters</label>
        <div className="toggle-filters">
          <label className="toggle-filter">
            <input
              type="checkbox"
              checked={showFundedOnly}
              onChange={onFundedToggle}
            />
            <span className="toggle-label">🏛️ Government funded</span>
          </label>
          <label className="toggle-filter">
            <input
              type="checkbox"
              checked={showSupplyChainOnly}
              onChange={onSupplyChainToggle}
            />
            <span className="toggle-label">🔗 Has supply chain</span>
          </label>
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-label">Mineral Type</label>
        <div className="mineral-checkboxes">
          {Object.entries(MINERAL_COLORS)
            .filter(([key]) => key !== "Other")
            .map(([mineral, color]) => (
              <label key={mineral} className="mineral-checkbox">
                <input
                  type="checkbox"
                  checked={selectedMinerals.includes(mineral)}
                  onChange={() => onMineralToggle(mineral)}
                />
                <span className="mineral-dot" style={{ backgroundColor: color }} />
                <span>{mineral}</span>
                <span className="mineral-count">{mineralCounts[mineral] || 0}</span>
              </label>
            ))}
        </div>
      </div>
    </div>
  );
}
