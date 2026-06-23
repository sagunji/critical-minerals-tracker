import type { MineralProject } from "../types";
import { formatCurrency } from "../types";

interface Props {
  projects: MineralProject[];
}

interface RegionData {
  name: string;
  investment: number;
  projectCount: number;
  minerals: string[];
}

export default function InvestmentHeatmap({ projects }: Props) {
  const regionMap = new Map<string, RegionData>();

  projects.forEach((p) => {
    const existing = regionMap.get(p.region) || {
      name: p.region,
      investment: 0,
      projectCount: 0,
      minerals: [],
    };
    existing.investment += p.investmentCAD || 0;
    existing.projectCount += 1;
    if (!existing.minerals.includes(p.primaryMineral)) {
      existing.minerals.push(p.primaryMineral);
    }
    regionMap.set(p.region, existing);
  });

  const regions = Array.from(regionMap.values())
    .filter((r) => r.investment > 0)
    .sort((a, b) => b.investment - a.investment);

  const maxInvestment = regions[0]?.investment || 1;

  return (
    <div className="investment-heatmap">
      <h3 className="heatmap-title">Investment by Region</h3>
      <p className="heatmap-subtitle">Publicly announced capital investment (CAD)</p>
      <div className="heatmap-bars">
        {regions.map((region) => (
          <div key={region.name} className="heatmap-row">
            <div className="heatmap-info">
              <span className="heatmap-region">{region.name}</span>
              <span className="heatmap-meta">
                {region.projectCount} project{region.projectCount > 1 ? "s" : ""} · {region.minerals.join(", ")}
              </span>
            </div>
            <div className="heatmap-bar-container">
              <div
                className="heatmap-bar"
                style={{
                  width: `${(region.investment / maxInvestment) * 100}%`,
                  opacity: 0.6 + (region.investment / maxInvestment) * 0.4,
                }}
              />
              <span className="heatmap-value">{formatCurrency(region.investment)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="heatmap-total">
        <span>Total tracked investment:</span>
        <strong>{formatCurrency(regions.reduce((s, r) => s + r.investment, 0))}</strong>
      </div>
    </div>
  );
}
