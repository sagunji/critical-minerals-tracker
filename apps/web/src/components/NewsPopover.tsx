import { useState, useEffect, useRef } from "react";
import { useChangelog } from "../hooks/useChangelog";
import type { ChangeEntry } from "../hooks/useChangelog";

interface Props {
  onClose: () => void;
  onProjectClick: (projectId: string) => void;
}

type TabId = "all" | "new_project" | "status_change" | "stage_change" | "other";

const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new_project", label: "New Projects" },
  { id: "stage_change", label: "Stage Changes" },
  { id: "status_change", label: "Status Changes" },
  { id: "other", label: "Other" },
];

const CHANGE_ICONS: Record<string, string> = {
  new_project: "✦",
  removed_project: "✕",
  stage_change: "↑",
  status_change: "◉",
  operator_change: "⇄",
  funding_change: "$",
  mineral_change: "◈",
};

function relativeDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "Last week";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return "Last month";

  return date.toLocaleDateString("en-CA", { month: "short", year: "numeric" });
}

interface GroupedChanges {
  label: string;
  changes: (ChangeEntry & { entryDate: string })[];
}

export default function NewsPopover({ onClose, onProjectClick }: Props) {
  const { entries, loading } = useChangelog();
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const allChanges = entries.flatMap((entry) =>
    entry.changes.map((c) => ({ ...c, entryDate: entry.to_date }))
  );

  const filteredChanges = allChanges.filter((c) => {
    if (activeTab === "all") return true;
    if (activeTab === "other") {
      return !["new_project", "stage_change", "status_change"].includes(c.type);
    }
    return c.type === activeTab;
  });

  const grouped: GroupedChanges[] = [];
  const seen = new Set<string>();
  for (const change of filteredChanges) {
    const label = relativeDate(change.entryDate);
    if (!seen.has(label)) {
      seen.add(label);
      grouped.push({ label, changes: [] });
    }
    grouped[grouped.length - 1].changes.push(change);
  }

  return (
    <div className="news-popover" ref={ref}>
      <div className="news-popover-header">
        <h3>What's New</h3>
        <button className="news-popover-close" onClick={onClose}>✕</button>
      </div>

      <div className="news-popover-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`news-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="news-popover-body">
        {loading ? (
          <p className="news-empty">Loading...</p>
        ) : filteredChanges.length === 0 ? (
          <p className="news-empty">
            {entries.length === 0
              ? "Change tracking started. Updates appear after the next weekly sync."
              : "No changes in this category yet."}
          </p>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="news-group">
              <div className="news-group-label">{group.label}</div>
              {group.changes.map((change, i) => (
                <div
                  key={i}
                  className={`news-item news-item-${change.significance}`}
                  onClick={() => onProjectClick(change.project_id)}
                >
                  <span className="news-item-icon">
                    {CHANGE_ICONS[change.type] || "•"}
                  </span>
                  <div className="news-item-content">
                    <span className="news-item-name">{change.project_name}</span>
                    <span className="news-item-desc">{change.description}</span>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
