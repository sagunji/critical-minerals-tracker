import type { MineralProject, SupplyChain } from "../types";
import { getMineralColor, formatCurrency } from "../types";
import SupplyChainDiagram from "./SupplyChainDiagram";
import ProjectTimeline from "./ProjectTimeline";
import FundingBadge from "./FundingBadge";
import ShareButton from "./ShareButton";

interface ProjectDetailProps {
  project: MineralProject;
  supplyChain: SupplyChain | null;
  onClose: () => void;
}

export default function ProjectDetail({ project, supplyChain, onClose }: ProjectDetailProps) {
  return (
    <div className="project-detail">
      <div className="detail-header">
        <div>
          <h2>{project.name}</h2>
          <p className="detail-operator">{project.operator}</p>
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="detail-badges">
        <span
          className="badge badge-mineral"
          style={{ backgroundColor: getMineralColor(project.primaryMineral) }}
        >
          {project.primaryMineral}
        </span>
        <span className="badge badge-stage">{project.stage}</span>
        <span className={`badge badge-status ${project.status === "Active" ? "active" : "inactive"}`}>
          {project.status}
        </span>
        {project.funding && project.funding.length > 0 && (
          <span className="badge badge-funded">🏛️ Gov Funded</span>
        )}
      </div>

      <p className="detail-description">{project.description}</p>

      {project.timeline && <ProjectTimeline timeline={project.timeline} />}

      <div className="detail-grid">
        <div className="detail-item">
          <span className="detail-label">Region</span>
          <span className="detail-value">{project.region}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">District</span>
          <span className="detail-value">{project.district}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Coordinates</span>
          <span className="detail-value">
            {project.latitude.toFixed(4)}°N, {Math.abs(project.longitude).toFixed(4)}°W
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Investment</span>
          <span className="detail-value">{formatCurrency(project.investmentCAD)}</span>
        </div>
        {project.annualProductionTarget && (
          <div className="detail-item full-width">
            <span className="detail-label">Production Target</span>
            <span className="detail-value">{project.annualProductionTarget}</span>
          </div>
        )}
      </div>

      {project.funding && project.funding.length > 0 && (
        <FundingBadge funding={project.funding} />
      )}

      <div className="detail-minerals">
        <span className="detail-label">All Minerals</span>
        <div className="mineral-tags">
          {project.minerals.map((mineral) => (
            <span
              key={mineral}
              className="mineral-tag"
              style={{ borderColor: getMineralColor(mineral) }}
            >
              {mineral}
            </span>
          ))}
        </div>
      </div>

      <ShareButton project={project} />

      {project.website && (
        <a href={project.website} target="_blank" rel="noopener noreferrer" className="detail-link">
          Visit Project Website →
        </a>
      )}

      {supplyChain && (
        <div className="detail-supply-chain">
          <h3>Supply Chain: Mine to Market</h3>
          <SupplyChainDiagram chain={supplyChain} />
        </div>
      )}

      <div className="detail-source">
        <span className="detail-label">Data Source</span>
        <span className="source-text">{project.source}</span>
      </div>
    </div>
  );
}
