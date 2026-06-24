import type { MineralProject } from "../types";
import { MINERAL_COLORS } from "../types";

interface DashboardProps {
  projects: MineralProject[];
}

export default function Dashboard({ projects }: DashboardProps) {
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const producingMines = projects.filter((p) => p.stage === "Producing Mine").length;
  const advancedProjects = projects.filter((p) => p.stage === "Advanced Project").length;

  const mineralCounts: Record<string, number> = {};
  projects.forEach((p) => {
    const mineral = p.primaryMineral;
    mineralCounts[mineral] = (mineralCounts[mineral] || 0) + 1;
  });

  const sortedMinerals = Object.entries(mineralCounts).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...Object.values(mineralCounts), 1);

  const processingProjects = projects.filter((p) => p.stage === "Advanced Processing Project").length;
  const processingFacilities = projects.filter((p) => p.stage === "Processing Facility").length;
  const fundedProjects = projects.filter((p) => p.funding && p.funding.length > 0).length;

  const stageCounts = [
    { label: "Producing Mines", count: producingMines, color: "#5a8a4a" },
    { label: "Advanced Projects", count: advancedProjects, color: "#c9922e" },
    { label: "Processing (Proposed)", count: processingProjects, color: "#8a7a30" },
    { label: "Processing (Active)", count: processingFacilities, color: "#b87333" },
  ];

  const regionCounts: Record<string, number> = {};
  projects.forEach((p) => {
    regionCounts[p.region] = (regionCounts[p.region] || 0) + 1;
  });
  const sortedRegions = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]);
  const maxRegionCount = Math.max(...Object.values(regionCounts), 1);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h3 className="font-display text-xl mb-6">Northern Ontario Critical Minerals</h3>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-bg-card rounded-lg p-4 border border-border text-center">
          <div className="text-2xl font-bold text-text">{projects.length}</div>
          <div className="text-xs text-text-muted mt-1">Total Projects</div>
        </div>
        <div className="bg-bg-card rounded-lg p-4 border border-border text-center">
          <div className="text-2xl font-bold text-text">{activeProjects}</div>
          <div className="text-xs text-text-muted mt-1">Active</div>
        </div>
        <div className="bg-bg-card rounded-lg p-4 border border-border text-center">
          <div className="text-2xl font-bold text-text">{fundedProjects}</div>
          <div className="text-xs text-text-muted mt-1">Gov. Funded</div>
        </div>
        <div className="bg-bg-card rounded-lg p-4 border border-border text-center">
          <div className="text-2xl font-bold text-text">{Object.keys(mineralCounts).length}</div>
          <div className="text-xs text-text-muted mt-1">Mineral Types</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-text">By Primary Mineral</h4>
          <div className="space-y-2">
            {sortedMinerals.map(([mineral, count]) => (
              <div key={mineral} className="flex items-center gap-2 text-xs">
                <span className="w-28 truncate text-text-muted">{mineral}</span>
                <div className="flex-1 h-4 bg-bg-muted rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm transition-all"
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                      backgroundColor: MINERAL_COLORS[mineral] || MINERAL_COLORS.Other,
                    }}
                  />
                </div>
                <span className="w-6 text-right text-text-muted">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-text">By Development Stage</h4>
          <div className="space-y-2">
            {stageCounts.map((stage) => (
              <div key={stage.label} className="flex items-center gap-3 p-2 rounded-md bg-bg">
                <div
                  className="w-1 h-6 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: stage.color }}
                />
                <span className="text-lg font-bold text-text">{stage.count}</span>
                <span className="text-xs text-text-muted">{stage.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-text">By Region</h4>
        <div className="space-y-2">
          {sortedRegions.map(([region, count]) => (
            <div key={region} className="flex items-center gap-2 text-xs">
              <span className="w-28 truncate text-text-muted">{region}</span>
              <div className="flex-1 h-4 bg-bg-muted rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all bg-accent"
                  style={{ width: `${(count / maxRegionCount) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-text-muted">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
