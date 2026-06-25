import type { MineralProject } from "../types";
import { getMineralColor } from "../types";
import FundingBadge from "./FundingBadge";
import ShareButton from "./ShareButton";

interface ProjectDetailProps {
  project: MineralProject;
  onClose: () => void;
  isInCompare?: boolean;
  onToggleCompare?: () => void;
  compareCount?: number;
  maxCompare?: number;
}

export default function ProjectDetail({ project, onClose, isInCompare, onToggleCompare, compareCount = 0, maxCompare = 4 }: ProjectDetailProps) {
  return (
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-display text-lg font-semibold">{project.name}</h2>
          <p className="text-sm text-text-muted">{project.operator}</p>
        </div>
        <button
          className="p-1 text-text-muted hover:text-text rounded-md"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span
          className="px-2 py-0.5 text-xs font-medium rounded-full text-white"
          style={{ backgroundColor: getMineralColor(project.primaryMineral) }}
        >
          {project.primaryMineral}
        </span>
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-bg-muted text-text-muted border border-border">
          {project.stage}
        </span>
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
            project.status === "Active"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          {project.status}
        </span>
        {project.funding && project.funding.length > 0 && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            🏛️ Gov Funded
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wide text-text-muted">Region</span>
          <span className="text-sm text-text">{project.region}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wide text-text-muted">Coordinates</span>
          <span className="text-sm text-text">
            {project.latitude.toFixed(4)}°N, {Math.abs(project.longitude).toFixed(4)}°W
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wide text-text-muted">Stage</span>
          <span className="text-sm text-text">{project.stage}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wide text-text-muted">Status</span>
          <span className="text-sm text-text">{project.status}</span>
        </div>
      </div>

      {project.funding && project.funding.length > 0 && (
        <FundingBadge funding={project.funding} />
      )}

      <div className="space-y-1">
        <span className="text-[10px] uppercase tracking-wide text-text-muted">All Minerals</span>
        <div className="flex flex-wrap gap-1">
          {project.minerals.map((mineral) => (
            <span
              key={mineral}
              className="px-2 py-0.5 text-xs rounded-full border text-text-muted"
              style={{ borderColor: getMineralColor(mineral) }}
            >
              {mineral}
            </span>
          ))}
        </div>
      </div>

      {(project.developmentStage || project.operationGroup || project.impactAssessmentUrl) && (
        <div className="p-3 bg-bg-muted rounded-md space-y-2">
          {project.developmentStage && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-wide text-text-muted">
                NRCan Development Stage
              </span>
              <span className="text-sm text-text">{project.developmentStage}</span>
            </div>
          )}
          {project.operationGroup && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-wide text-text-muted">
                Operation Group
              </span>
              <span className="text-sm text-text">{project.operationGroup}</span>
            </div>
          )}
          {project.impactAssessmentUrl && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-wide text-text-muted">
                Impact Assessment
              </span>
              <a
                href={project.impactAssessmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline"
              >
                IAAC Registry →
              </a>
            </div>
          )}
        </div>
      )}

      {onToggleCompare && (
        <button
          onClick={onToggleCompare}
          disabled={!isInCompare && compareCount >= maxCompare}
          className={`w-full py-2 text-sm font-medium rounded-md transition-colors ${
            isInCompare
              ? "bg-accent text-white hover:bg-accent-hover"
              : compareCount >= maxCompare
                ? "bg-bg-muted text-text-muted cursor-not-allowed"
                : "bg-bg-muted text-text hover:bg-border"
          }`}
        >
          {isInCompare ? "Remove from Compare" : compareCount >= maxCompare ? `Compare full (${maxCompare} max)` : "+ Add to Compare"}
        </button>
      )}

      <ShareButton project={project} />

      {project.website && (
        <a
          href={project.website}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-accent hover:underline"
        >
          Visit Project Website →
        </a>
      )}

      <div className="pt-3 border-t border-border space-y-1">
        <span className="text-[10px] uppercase tracking-wide text-text-muted">Data Source</span>
        <span className="text-[11px] text-text-muted">{project.source}</span>
      </div>
    </div>
  );
}
