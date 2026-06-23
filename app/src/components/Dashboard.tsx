import type { MineralProject } from "../types";
import { MINERAL_COLORS, formatCurrency } from "../types";
import InvestmentHeatmap from "./InvestmentHeatmap";

interface DashboardProps {
  projects: MineralProject[];
}

export default function Dashboard({ projects }: DashboardProps) {
  const totalInvestment = projects.reduce((sum, p) => sum + (p.investmentCAD || 0), 0);
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const producingMines = projects.filter((p) => p.stage === "Producing Mine").length;
  const advancedProjects = projects.filter((p) => p.stage === "Advanced Project").length;

  const mineralCounts: Record<string, number> = {};
  projects.forEach((p) => {
    const mineral = p.primaryMineral;
    mineralCounts[mineral] = (mineralCounts[mineral] || 0) + 1;
  });

  const sortedMinerals = Object.entries(mineralCounts).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...Object.values(mineralCounts));

  const processingProjects = projects.filter((p) => p.stage === "Advanced Processing Project").length;
  const processingFacilities = projects.filter((p) => p.stage === "Processing Facility").length;
  const fundedProjects = projects.filter((p) => p.funding && p.funding.length > 0).length;

  const stageCounts = [
    { label: "Producing Mines", count: producingMines, color: "#4CAF50" },
    { label: "Advanced Projects", count: advancedProjects, color: "#FF9800" },
    { label: "Processing (Proposed)", count: processingProjects, color: "#7C4DFF" },
    { label: "Processing (Active)", count: processingFacilities, color: "#2196F3" },
  ];

  return (
    <div className="dashboard">
      <h3 className="dashboard-title">Northern Ontario Critical Minerals</h3>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{projects.length}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{activeProjects}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatCurrency(totalInvestment)}</div>
          <div className="stat-label">Total Investment</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{fundedProjects}</div>
          <div className="stat-label">Gov. Funded</div>
        </div>
      </div>

      <div className="dashboard-two-col">
        <div className="chart-section">
          <h4>By Primary Mineral</h4>
          <div className="bar-chart">
            {sortedMinerals.map(([mineral, count]) => (
              <div key={mineral} className="bar-row">
                <span className="bar-label">{mineral}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                      backgroundColor: MINERAL_COLORS[mineral] || MINERAL_COLORS.Other,
                    }}
                  />
                </div>
                <span className="bar-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-section">
          <h4>By Development Stage</h4>
          <div className="stage-pills">
            {stageCounts.map((stage) => (
              <div key={stage.label} className="stage-pill">
                <div className="stage-pill-bar" style={{ backgroundColor: stage.color }} />
                <span className="stage-pill-count">{stage.count}</span>
                <span className="stage-pill-label">{stage.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <InvestmentHeatmap projects={projects} />
    </div>
  );
}
