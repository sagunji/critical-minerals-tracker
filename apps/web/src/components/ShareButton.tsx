import { useState } from "react";
import type { MineralProject } from "../types";

interface Props {
  project: MineralProject;
}

const buttonClass =
  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-bg-muted transition-colors";

export default function ShareButton({ project }: Props) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}${window.location.pathname}?project=${project.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopySummary = async () => {
    const summary = [
      project.name,
      `Operator: ${project.operator}`,
      `Primary Mineral: ${project.primaryMineral}`,
      `Stage: ${project.stage}`,
      `Region: ${project.region}`,
      `Status: ${project.status}`,
      ``,
      `Source: ${project.source}`,
      `Link: ${shareUrl}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail
    }
  };

  return (
    <div className="flex gap-2">
      <button className={buttonClass} onClick={handleCopyLink} title="Copy shareable link">
        {copied ? "✓ Copied!" : "🔗 Copy Link"}
      </button>
      <button className={buttonClass} onClick={handleCopySummary} title="Copy project summary">
        📋 Copy Summary
      </button>
    </div>
  );
}
