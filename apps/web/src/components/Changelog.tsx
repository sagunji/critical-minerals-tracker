import { useChangelog } from "../hooks/useChangelog";
import type { ChangeEntry } from "../hooks/useChangelog";

interface Props {
  onProjectClick?: (projectId: string) => void;
}

const CHANGE_ICONS: Record<string, string> = {
  new_project: "✦",
  removed_project: "✕",
  stage_change: "↑",
  status_change: "◉",
  operator_change: "⇄",
  funding_change: "$",
  mineral_change: "◈",
};

const CHANGE_LABELS: Record<string, string> = {
  new_project: "New Project",
  removed_project: "Removed",
  stage_change: "Stage Change",
  status_change: "Status Change",
  operator_change: "Operator Change",
  funding_change: "Funding",
  mineral_change: "Reclassified",
};

function ChangeItem({ change, onProjectClick }: { change: ChangeEntry; onProjectClick?: (id: string) => void }) {
  const icon = CHANGE_ICONS[change.type] || "•";
  const label = CHANGE_LABELS[change.type] || change.type;

  return (
    <div
      className={`changelog-item changelog-${change.significance}`}
      onClick={() => onProjectClick?.(change.project_id)}
      role={onProjectClick ? "button" : undefined}
      tabIndex={onProjectClick ? 0 : undefined}
    >
      <span className="changelog-icon">{icon}</span>
      <div className="changelog-content">
        <span className="changelog-type">{label}</span>
        <span className="changelog-desc">{change.description}</span>
      </div>
    </div>
  );
}

export default function Changelog({ onProjectClick }: Props) {
  const { entries, loading } = useChangelog();

  if (loading) return null;
  if (entries.length === 0) {
    return (
      <div className="changelog">
        <h3 className="changelog-title">What's New</h3>
        <p className="changelog-empty">
          Change tracking started. Updates will appear here after the next weekly sync.
        </p>
      </div>
    );
  }

  const latest = entries[0];
  const dateRange = `${formatDate(latest.from_date)} → ${formatDate(latest.to_date)}`;

  return (
    <div className="changelog">
      <div className="changelog-header">
        <h3 className="changelog-title">What's New</h3>
        <span className="changelog-date">{dateRange}</span>
      </div>
      <div className="changelog-list">
        {latest.changes.map((change, i) => (
          <ChangeItem key={i} change={change} onProjectClick={onProjectClick} />
        ))}
      </div>
      {entries.length > 1 && (
        <p className="changelog-more">
          + {entries.length - 1} earlier update{entries.length > 2 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}
