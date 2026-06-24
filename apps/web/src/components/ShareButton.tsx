import { useState } from "react";
import type { MineralProject } from "../types";

interface Props {
  project: MineralProject;
}

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
      project.investmentCAD ? `Investment: ${formatInvestment(project.investmentCAD)}` : null,
      project.annualProductionTarget ? `Production: ${project.annualProductionTarget}` : null,
      ``,
      project.description,
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
    <div className="share-buttons">
      <button className="share-btn" onClick={handleCopyLink} title="Copy shareable link">
        {copied ? "✓ Copied!" : "🔗 Copy Link"}
      </button>
      <button className="share-btn share-btn-secondary" onClick={handleCopySummary} title="Copy project summary">
        📋 Copy Summary
      </button>
    </div>
  );
}

function formatInvestment(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B CAD`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(0)}M CAD`;
  return `$${amount.toLocaleString()} CAD`;
}
