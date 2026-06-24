import type { MineralProject } from "../types";
import { getMineralColor } from "../types";
import FundingBadge from "./FundingBadge";
import ShareButton from "./ShareButton";

interface ProjectDetailProps {
  project: MineralProject;
  onClose: () => void;
}

export default function ProjectDetail({ project, onClose }: ProjectDetailProps) {
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

      <div className="detail-grid">
        <div className="detail-item">
          <span className="detail-label">Region</span>
          <span className="detail-value">{project.region}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Coordinates</span>
          <span className="detail-value">
            {project.latitude.toFixed(4)}°N, {Math.abs(project.longitude).toFixed(4)}°W
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Stage</span>
          <span className="detail-value">{project.stage}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Status</span>
          <span className="detail-value">{project.status}</span>
        </div>
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

      {(project.developmentStage || project.operationGroup || project.impactAssessmentUrl) && (
        <div className="detail-intelligence">
          {project.developmentStage && (
            <div className="detail-item">
              <span className="detail-label">NRCan Development Stage</span>
              <span className="detail-value">{project.developmentStage}</span>
            </div>
          )}
          {project.operationGroup && (
            <div className="detail-item">
              <span className="detail-label">Operation Group</span>
              <span className="detail-value">{project.operationGroup}</span>
            </div>
          )}
          {project.impactAssessmentUrl && (
            <div className="detail-item">
              <span className="detail-label">Impact Assessment</span>
              <a
                href={project.impactAssessmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="detail-value detail-link-inline"
              >
                IAAC Registry →
              </a>
            </div>
          )}
        </div>
      )}

      <ShareButton project={project} />

      {project.website && (
        <a href={project.website} target="_blank" rel="noopener noreferrer" className="detail-link">
          Visit Project Website →
        </a>
      )}

      <div className="detail-source">
        <span className="detail-label">Data Source</span>
        <span className="source-text">{project.source}</span>
      </div>
    </div>
  );
}
