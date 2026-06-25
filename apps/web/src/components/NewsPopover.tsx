import * as Tabs from "@radix-ui/react-tabs";
import { useChangelog } from "../hooks/useChangelog";
import type { ChangeEntry } from "../hooks/useChangelog";

interface Props {
  onProjectClick: (projectId: string) => void;
}

type TabId = "new" | "all";

const TABS: { id: TabId; label: string }[] = [
  { id: "new", label: "New" },
  { id: "all", label: "All" },
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

function significanceColor(significance: string): string {
  switch (significance) {
    case "high":
      return "bg-accent";
    case "medium":
      return "bg-gray-400";
    default:
      return "bg-border";
  }
}

function filterChanges(changes: (ChangeEntry & { entryDate: string })[], tabId: TabId) {
  if (tabId === "all") return changes;
  return changes.filter((c) => c.type === "new_project");
}

function groupChanges(changes: (ChangeEntry & { entryDate: string })[]): GroupedChanges[] {
  const grouped: GroupedChanges[] = [];
  const seen = new Set<string>();
  for (const change of changes) {
    const label = relativeDate(change.entryDate);
    if (!seen.has(label)) {
      seen.add(label);
      grouped.push({ label, changes: [] });
    }
    grouped[grouped.length - 1].changes.push(change);
  }
  return grouped;
}

function ChangeList({
  changes,
  loading,
  entriesCount,
  onProjectClick,
}: {
  changes: (ChangeEntry & { entryDate: string })[];
  loading: boolean;
  entriesCount: number;
  onProjectClick: (projectId: string) => void;
}) {
  if (loading) {
    return <p className="text-sm text-text-muted text-center py-8">Loading...</p>;
  }

  if (changes.length === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-8">
        {entriesCount === 0
          ? "Change tracking started. Updates appear after the next weekly sync."
          : "No changes in this category yet."}
      </p>
    );
  }

  return (
    <>
      {groupChanges(changes).map((group) => (
        <div key={group.label}>
          <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium px-3 py-1.5 sticky top-0 bg-bg-card/95 backdrop-blur-sm">
            {group.label}
          </div>
          {group.changes.map((change, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 px-3 py-2 cursor-pointer hover:bg-bg-muted rounded-r-md"
              onClick={() => onProjectClick(change.project_id)}
            >
              <div className={`w-0.5 self-stretch rounded-full flex-shrink-0 ${significanceColor(change.significance)}`} />
              <span className="text-xs mt-0.5 text-text-muted">{CHANGE_ICONS[change.type] || "•"}</span>
              <div className="flex flex-col min-w-0 gap-0.5">
                <span className="text-[13px] font-medium text-text">{change.project_name}</span>
                <span className="text-[11px] text-text-muted leading-tight">
                  {change.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

export default function NewsPopover({ onProjectClick }: Props) {
  const { entries, loading } = useChangelog();

  const allChanges = entries.flatMap((entry) =>
    entry.changes.map((c) => ({ ...c, entryDate: entry.to_date }))
  );

  return (
    <div className="w-[380px] max-h-[480px] flex flex-col">
      <div className="px-4 pt-3 pb-1">
        <h3 className="font-display text-sm font-semibold">What&apos;s New</h3>
      </div>

      <Tabs.Root defaultValue="new" className="flex flex-col flex-1 min-h-0">
        <Tabs.List className="flex gap-0.5 px-4 pb-2 border-b border-border">
          {TABS.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              value={tab.id}
              className="px-2 py-1 text-[11px] font-medium rounded-sm text-text-muted transition-colors data-[state=active]:bg-accent data-[state=active]:text-white"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {TABS.map((tab) => (
          <Tabs.Content
            key={tab.id}
            value={tab.id}
            className="flex-1 overflow-y-auto px-1 pb-3 outline-none"
          >
            <ChangeList
              changes={filterChanges(allChanges, tab.id)}
              loading={loading}
              entriesCount={entries.length}
              onProjectClick={onProjectClick}
            />
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </div>
  );
}
