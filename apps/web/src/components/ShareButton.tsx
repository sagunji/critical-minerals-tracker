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
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
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
