import { useState } from "react";
import type { MineralProject } from "../types";
import { MINERAL_COLORS } from "../types";

interface StatsBubbleProps {
  projects: MineralProject[];
}

export default function StatsBubble({ projects }: StatsBubbleProps) {
  const [expanded, setExpanded] = useState(false);

  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const suspendedProjects = projects.filter((p) => p.status !== "Active").length;
  const fundedProjects = projects.filter((p) => p.funding && p.funding.length > 0);

  const totalFunding = fundedProjects.reduce(
    (sum, p) => sum + (p.funding?.reduce((s, f) => s + (f.amount || 0), 0) || 0),
    0
  );

  const formatFunding = (amount: number) => {
    if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(0)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  const mineralCounts: Record<string, number> = {};
  projects.forEach((p) => {
    for (const [key] of Object.entries(MINERAL_COLORS)) {
      if (key === "Other") continue;
      if (
        p.primaryMineral.toLowerCase().includes(key.toLowerCase()) ||
        p.minerals.some((m) => m.toLowerCase().includes(key.toLowerCase()))
      ) {
        mineralCounts[key] = (mineralCounts[key] || 0) + 1;
      }
    }
  });
  const topMinerals = Object.entries(mineralCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCount = Math.max(...topMinerals.map(([, c]) => c), 1);

  const provinceCounts: Record<string, number> = {};
  projects.forEach((p) => {
    provinceCounts[p.province] = (provinceCounts[p.province] || 0) + 1;
  });
  const topProvinces = Object.entries(provinceCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const operatorCounts: Record<string, number> = {};
  projects.forEach((p) => {
    operatorCounts[p.operator] = (operatorCounts[p.operator] || 0) + 1;
  });
  const topOperators = Object.entries(operatorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const producingMines = projects.filter((p) => p.stage === "Producing Mine").length;

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="absolute bottom-4 left-4 z-[500] bg-bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs text-text shadow-md hover:shadow-lg transition-shadow flex items-center gap-3"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-base font-bold text-accent">{projects.length}</span>
          <span className="text-text-muted">projects</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">{producingMines}</span>
          <span className="text-text-muted">producing</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">{fundedProjects.length}</span>
          <span className="text-text-muted">funded</span>
        </div>
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 left-4 z-[500] w-80 bg-bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold text-text">Intelligence Overview</span>
        <button
          onClick={() => setExpanded(false)}
          className="text-text-muted hover:text-text text-sm leading-none p-0.5"
        >
          ×
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Key metrics */}
        <div className="grid grid-cols-4 gap-1.5">
          <div className="text-center px-1 py-1.5 rounded-md bg-bg-muted">
            <div className="text-sm font-bold text-text">{projects.length}</div>
            <div className="text-[9px] text-text-muted">Projects</div>
          </div>
          <div className="text-center px-1 py-1.5 rounded-md bg-bg-muted">
            <div className="text-sm font-bold text-green-700">{activeProjects}</div>
            <div className="text-[9px] text-text-muted">Active</div>
          </div>
          <div className="text-center px-1 py-1.5 rounded-md bg-bg-muted">
            <div className="text-sm font-bold text-amber-700">{suspendedProjects}</div>
            <div className="text-[9px] text-text-muted">On Hold</div>
          </div>
          <div className="text-center px-1 py-1.5 rounded-md bg-bg-muted">
            <div className="text-sm font-bold text-accent">{producingMines}</div>
            <div className="text-[9px] text-text-muted">Producing</div>
          </div>
        </div>

        {/* Funding callout */}
        {totalFunding > 0 && (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-amber-50 border border-amber-100">
            <span className="text-xs">🏛️</span>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] text-amber-800 font-medium">
                {formatFunding(totalFunding)} gov. funding across {fundedProjects.length} projects
              </span>
            </div>
          </div>
        )}

        {/* Top minerals */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wide text-text-muted font-medium">Top Minerals</span>
          {topMinerals.map(([mineral, count]) => (
            <div key={mineral} className="flex items-center gap-1.5 text-[11px]">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: MINERAL_COLORS[mineral] || MINERAL_COLORS.Other }}
              />
              <span className="w-16 truncate text-text">{mineral}</span>
              <div className="flex-1 h-2 bg-bg-muted rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm"
                  style={{
                    width: `${(count / maxCount) * 100}%`,
                    backgroundColor: MINERAL_COLORS[mineral] || MINERAL_COLORS.Other,
                  }}
                />
              </div>
              <span className="w-5 text-right text-text-muted font-medium">{count}</span>
            </div>
          ))}
        </div>

        {/* Province breakdown */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wide text-text-muted font-medium">By Province</span>
          <div className="flex flex-wrap gap-1">
            {topProvinces.map(([prov, count]) => (
              <span
                key={prov}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full bg-bg-muted text-text-muted"
              >
                <span className="font-semibold text-text">{count}</span>
                {prov}
              </span>
            ))}
          </div>
        </div>

        {/* Top operators */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wide text-text-muted font-medium">Top Operators</span>
          <div className="space-y-0.5">
            {topOperators.map(([op, count]) => (
              <div key={op} className="flex items-center justify-between text-[11px]">
                <span className="truncate text-text-muted">{op}</span>
                <span className="text-text font-medium ml-2 flex-shrink-0">{count} projects</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
