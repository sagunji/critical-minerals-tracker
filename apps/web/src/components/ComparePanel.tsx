import type { MineralProject } from "../types";
import { getMineralColor, formatCurrency } from "../types";

interface ComparePanelProps {
  projects: MineralProject[];
  onRemove: (id: string) => void;
  onClose: () => void;
  onSelectProject: (project: MineralProject) => void;
}

const COMPARE_FIELDS: {
  label: string;
  key: string;
  render: (p: MineralProject) => React.ReactNode;
}[] = [
  {
    label: "Stage / Status",
    key: "stage_status",
    render: (p) => (
      <div className="flex flex-wrap gap-1">
        <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-bg-muted text-text-muted border border-border">
          {p.stage}
        </span>
        <span
          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${
            p.status === "Active"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          {p.status}
        </span>
      </div>
    ),
  },
  {
    label: "Operator",
    key: "operator",
    render: (p) => <span className="font-medium">{p.operator}</span>,
  },
  {
    label: "Minerals",
    key: "minerals",
    render: (p) => (
      <div className="flex flex-wrap gap-1">
        <span
          className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full text-white"
          style={{ backgroundColor: getMineralColor(p.primaryMineral) }}
        >
          {p.primaryMineral}
        </span>
        {p.minerals
          .filter((m) => m !== p.primaryMineral)
          .slice(0, 3)
          .map((m) => (
            <span
              key={m}
              className="px-1.5 py-0.5 text-[10px] rounded-full border text-text-muted"
              style={{ borderColor: getMineralColor(m) }}
            >
              {m}
            </span>
          ))}
        {p.minerals.length > 4 && (
          <span className="text-[10px] text-text-muted">+{p.minerals.length - 4}</span>
        )}
      </div>
    ),
  },
  {
    label: "Province",
    key: "province",
    render: (p) => p.province,
  },
  {
    label: "Gov. Funding",
    key: "funding",
    render: (p) => {
      if (!p.funding || p.funding.length === 0) {
        return <span className="text-text-muted">None</span>;
      }
      const total = p.funding.reduce((s, f) => s + (f.amount || 0), 0);
      return (
        <div className="space-y-0.5">
          <span className="text-amber-800 font-semibold">{formatCurrency(total)}</span>
          {p.funding.map((f, i) => (
            <div key={i} className="text-[10px] text-amber-600">{f.purpose || f.program}</div>
          ))}
        </div>
      );
    },
  },
  {
    label: "NRCan Stage",
    key: "devStage",
    render: (p) =>
      p.developmentStage ? (
        <span className="text-sm">{p.developmentStage}</span>
      ) : (
        <span className="text-text-muted">--</span>
      ),
  },
  {
    label: "Impact Assessment",
    key: "iaac",
    render: (p) =>
      p.impactAssessmentUrl ? (
        <a
          href={p.impactAssessmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline text-xs"
        >
          IAAC Registry &#8599;
        </a>
      ) : (
        <span className="text-text-muted">--</span>
      ),
  },
];

export default function ComparePanel({
  projects,
  onRemove,
  onClose,
  onSelectProject,
}: ComparePanelProps) {
  const shareUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("project");
    url.searchParams.set("compare", projects.map((p) => p.id).join(","));
    return url.toString();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl());
  };

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative mt-auto max-h-[85vh] bg-bg-card border-t border-border rounded-t-xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-2 fade-in-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-base font-semibold text-text">
              Compare Projects
            </h2>
            <span className="text-xs text-text-muted px-2 py-0.5 bg-bg-muted rounded-full">
              {projects.length} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1 text-xs font-medium text-accent hover:text-accent-hover rounded-md hover:bg-bg-muted transition-colors"
            >
              Copy Link
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text rounded-md hover:bg-bg-muted transition-colors"
              aria-label="Close comparison"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="sticky left-0 bg-bg-card z-10 text-left px-5 py-2.5 text-[10px] uppercase tracking-wide text-text-muted font-medium w-36">
                  Field
                </th>
                {projects.map((p) => (
                  <th key={p.id} className="text-left px-4 py-2.5 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onSelectProject(p);
                          onClose();
                        }}
                        className="font-display text-sm font-semibold text-text hover:text-accent transition-colors text-left truncate"
                      >
                        {p.name}
                      </button>
                      <button
                        onClick={() => onRemove(p.id)}
                        className="flex-shrink-0 p-0.5 text-text-muted hover:text-red-500 rounded transition-colors"
                        aria-label={`Remove ${p.name}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M3 3l6 6M9 3l-6 6" />
                        </svg>
                      </button>
                    </div>
                  </th>
                ))}
                {projects.length < 4 && (
                  <th className="text-left px-4 py-2.5 min-w-[160px]">
                    <span className="text-xs text-text-muted">
                      Select more on map...
                    </span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {COMPARE_FIELDS.map((field) => (
                <tr key={field.key} className="border-b border-border/50 hover:bg-bg-muted/30">
                  <td className="sticky left-0 bg-bg-card z-10 px-5 py-2.5 text-[10px] uppercase tracking-wide text-text-muted font-medium align-top">
                    {field.label}
                  </td>
                  {projects.map((p) => (
                    <td key={p.id} className="px-4 py-2.5 text-sm text-text align-top">
                      {field.render(p)}
                    </td>
                  ))}
                  {projects.length < 4 && <td />}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
