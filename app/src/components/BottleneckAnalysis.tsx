import { useState } from "react";
import type { MineralProject } from "../types";

interface Props {
  projects: MineralProject[];
}

type Severity = "critical" | "severe" | "moderate" | "adequate";

interface MineralFlowInput {
  mineral: string;
  color: string;
  supplyTonnes: number | null;
  processingCapacity: number | null;
  demandTonnes: number | null;
  demandSource: string;
  dataReferences: string[];
}

interface MineralFlow extends MineralFlowInput {
  miningProjects: MineralProject[];
  processingProjects: MineralProject[];
  activeProcessors: MineralProject[];
  gapRatio: number | null;
  gapSeverity: Severity;
  insight: string;
}

function calculateGapSeverity(
  processingCapacity: number | null,
  demandTonnes: number | null,
  supplyTonnes: number | null,
  activeProcessorCount: number,
  miningProjectCount: number
): { severity: Severity; gapRatio: number | null } {
  const referenceVolume = demandTonnes ?? supplyTonnes;

  if (referenceVolume && referenceVolume > 0 && processingCapacity !== null) {
    const ratio = 1 - processingCapacity / referenceVolume;

    if (processingCapacity === 0 && referenceVolume > 0) {
      return { severity: "critical", gapRatio: 1.0 };
    }
    if (ratio >= 0.7) return { severity: "severe", gapRatio: ratio };
    if (ratio >= 0.3) return { severity: "moderate", gapRatio: ratio };
    return { severity: "adequate", gapRatio: ratio };
  }

  if (activeProcessorCount === 0 && miningProjectCount > 0) {
    return { severity: "critical", gapRatio: null };
  }
  if (activeProcessorCount > 0 && miningProjectCount > activeProcessorCount * 3) {
    return { severity: "moderate", gapRatio: null };
  }
  return { severity: "adequate", gapRatio: null };
}

function generateInsight(flow: MineralFlow): string {
  const { mineral, gapSeverity, gapRatio, miningProjects, activeProcessors, processingProjects, processingCapacity, supplyTonnes, demandTonnes } = flow;

  if (gapSeverity === "critical") {
    const proposed = processingProjects.length > 0 ? ` ${processingProjects.length} refiner(ies) proposed but not yet operating.` : " No processing facilities proposed.";
    return `${miningProjects.length} ${mineral.toLowerCase()} mining/deposit projects exist, but active processing capacity is ZERO.${proposed} Gap ratio: 1.0 — complete value chain break.`;
  }
  if (gapSeverity === "severe") {
    const gap = (supplyTonnes || 0) - (processingCapacity || 0);
    return `${miningProjects.length} mining projects can supply ~${supplyTonnes?.toLocaleString()} t/y, but only ${activeProcessors.length} processor(s) handle ~${processingCapacity?.toLocaleString()} t/y. Gap: ~${gap.toLocaleString()} t/y unprocessable in Ontario (ratio: ${gapRatio?.toFixed(2)}).`;
  }
  if (gapSeverity === "moderate") {
    return `Current processing capacity meets demand (~${demandTonnes?.toLocaleString()} t/y) but has limited growth headroom. Gap ratio: ${gapRatio?.toFixed(2)}.`;
  }
  return `Processing capacity (~${processingCapacity?.toLocaleString()} t/y) meets or exceeds projected demand (~${demandTonnes?.toLocaleString()} t/y). Value chain intact.`;
}

const FLOWS: MineralFlowInput[] = [
  {
    mineral: "Nickel",
    color: "#4CAF50",
    supplyTonnes: 63000,
    processingCapacity: 15000,
    demandTonnes: 50000,
    demandSource: "NextStar + PowerCo + GM Ultium gigafactories",
    dataReferences: [
      "NRCan Critical Minerals Projects Database (2024)",
      "Ontario's Critical Minerals Strategy 2022–2027, p.18",
      "Vale Sudbury Complex Annual Production Reports",
    ],
  },
  {
    mineral: "Lithium",
    color: "#7C4DFF",
    supplyTonnes: 23174,
    processingCapacity: 0,
    demandTonnes: 20000,
    demandSource: "3 Ontario gigafactories (cathode-grade LiOH)",
    dataReferences: [
      "NRCan Critical Minerals Projects Database (2024) — 6 lithium deposits",
      "Ontario Ministry of Mines: Critical Minerals Strategy 2022–2027, p.22",
      "Avalon Advanced Materials NI 43-101 Technical Report (2023)",
    ],
  },
  {
    mineral: "Cobalt",
    color: "#42A5F5",
    supplyTonnes: 1600,
    processingCapacity: 0,
    demandTonnes: 5000,
    demandSource: "NMC cathode production for Ontario battery plants",
    dataReferences: [
      "Electra Battery Materials Corp. Feasibility Study (2022)",
      "NRCan Advanced Projects Registry",
      "IEA Global EV Outlook 2023 — cobalt demand projection",
    ],
  },
  {
    mineral: "Graphite",
    color: "#455A64",
    supplyTonnes: null,
    processingCapacity: 0,
    demandTonnes: 30000,
    demandSource: "Battery anode material (all lithium-ion cells)",
    dataReferences: [
      "Canada Graphite Corp. & Northern Graphite NI 43-101 reports",
      "NRCan — Canada's Graphite Market Report (2023)",
      "IEA Critical Minerals Report 2023 — graphite demand",
    ],
  },
  {
    mineral: "Copper",
    color: "#FF7043",
    supplyTonnes: 20000,
    processingCapacity: 25000,
    demandTonnes: 15000,
    demandSource: "EV wiring, grid infrastructure, battery current collectors",
    dataReferences: [
      "Vale Copper Cliff Operations production data",
      "Glencore Sudbury smelter capacity reports",
      "NRCan Canadian Minerals Yearbook — Copper chapter (2023)",
    ],
  },
  {
    mineral: "Platinum Group Metals",
    color: "#78909C",
    supplyTonnes: null,
    processingCapacity: null,
    demandTonnes: null,
    demandSource: "Hydrogen fuel cells, catalytic converters",
    dataReferences: [
      "Impala Canada — Lac des Iles mine production data",
      "NRCan PGM mineral summary (2023)",
    ],
  },
];

const METHODOLOGY = {
  formula: "Gap Ratio = 1 − (Processing Capacity ÷ Reference Volume)",
  referenceNote: "Reference Volume = demand estimate if available, otherwise projected mine supply",
  thresholds: [
    { label: "Critical", range: "Ratio = 1.0 (zero processing capacity)", color: "#d32f2f" },
    { label: "Severe", range: "Ratio ≥ 0.70", color: "#f57c00" },
    { label: "Moderate", range: "0.30 ≤ Ratio < 0.70", color: "#fbc02d" },
    { label: "Adequate", range: "Ratio < 0.30", color: "#388e3c" },
  ],
  sources: [
    "Canada's Critical Minerals Strategy (NRCan, Dec 2022) — identifies domestic processing gaps",
    "Ontario's Critical Minerals Strategy 2022–2027 — defines provincial supply chain priorities",
    "IEA Critical Minerals Market Review 2023 — global supply concentration & processing share data",
    "NRCan Critical Minerals Projects ArcGIS Database — project-level supply/capacity figures",
    "NI 43-101 Technical Reports — individual project tonnage estimates",
  ],
  fallbackNote: "When tonnage data is unavailable, severity falls back to a heuristic: 0 active processors with ≥1 mining project = Critical; processors < ⅓ of mining projects = Moderate.",
};

export default function BottleneckAnalysis({ projects }: Props) {
  const [showMethodology, setShowMethodology] = useState(false);

  const flows: MineralFlow[] = FLOWS.map((flow) => {
    const miningProjects = projects.filter(
      (p) =>
        (p.stage === "Producing Mine" || p.stage === "Advanced Project") &&
        (p.primaryMineral.includes(flow.mineral) ||
          p.minerals.some((m) => m.includes(flow.mineral)))
    );
    const processingProjects = projects.filter(
      (p) =>
        p.stage === "Advanced Processing Project" &&
        (p.primaryMineral.includes(flow.mineral) ||
          p.minerals.some((m) => m.includes(flow.mineral)))
    );
    const activeProcessors = projects.filter(
      (p) =>
        p.stage === "Processing Facility" &&
        (p.primaryMineral.includes(flow.mineral) ||
          p.minerals.some((m) => m.includes(flow.mineral)))
    );

    const { severity, gapRatio } = calculateGapSeverity(
      flow.processingCapacity,
      flow.demandTonnes,
      flow.supplyTonnes,
      activeProcessors.length,
      miningProjects.length
    );

    const partial: MineralFlow = {
      ...flow,
      miningProjects,
      processingProjects,
      activeProcessors,
      gapRatio,
      gapSeverity: severity,
      insight: "",
    };

    partial.insight = generateInsight(partial);
    return partial;
  });

  return (
    <div className="bottleneck-analysis">
      <div className="bottleneck-header">
        <h2>Supply Chain Bottleneck Analysis</h2>
        <p className="bottleneck-subtitle">
          Where Ontario's critical minerals value chain is broken — and what needs to be fixed
        </p>
      </div>

      <div className="bottleneck-summary">
        <div className="severity-legend">
          <span className="severity-item severity-critical">● Critical Gap</span>
          <span className="severity-item severity-severe">● Severe</span>
          <span className="severity-item severity-moderate">● Moderate</span>
          <span className="severity-item severity-adequate">● Adequate</span>
          <button
            className="methodology-toggle"
            onClick={() => setShowMethodology(!showMethodology)}
          >
            {showMethodology ? "Hide" : "Show"} Methodology
          </button>
        </div>
      </div>

      {showMethodology && (
        <div className="methodology-panel">
          <h4>Severity Scoring Methodology</h4>
          <div className="methodology-formula">
            <code>{METHODOLOGY.formula}</code>
            <p className="methodology-note">{METHODOLOGY.referenceNote}</p>
          </div>
          <div className="methodology-thresholds">
            <h5>Thresholds</h5>
            {METHODOLOGY.thresholds.map((t) => (
              <div key={t.label} className="threshold-row">
                <span className="threshold-dot" style={{ backgroundColor: t.color }} />
                <strong>{t.label}</strong>: {t.range}
              </div>
            ))}
          </div>
          <p className="methodology-note">{METHODOLOGY.fallbackNote}</p>
          <div className="methodology-sources">
            <h5>Data Sources & References</h5>
            <ol>
              {METHODOLOGY.sources.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      <div className="bottleneck-flows">
        {flows.map((flow) => (
          <div key={flow.mineral} className={`flow-card flow-card--${flow.gapSeverity}`}>
            <div className="flow-card-header">
              <div className="flow-mineral-badge" style={{ backgroundColor: flow.color }}>
                {flow.mineral}
              </div>
              <span className={`severity-badge severity-badge--${flow.gapSeverity}`}>
                {flow.gapSeverity === "critical" && "⚠️ CRITICAL GAP"}
                {flow.gapSeverity === "severe" && "🔶 SEVERE"}
                {flow.gapSeverity === "moderate" && "◆ MODERATE"}
                {flow.gapSeverity === "adequate" && "✓ ADEQUATE"}
                {flow.gapRatio !== null && (
                  <span className="severity-ratio"> ({(flow.gapRatio * 100).toFixed(0)}%)</span>
                )}
              </span>
            </div>

            <div className="flow-pipeline">
              <div className="pipeline-stage">
                <div className="pipeline-label">Mining / Extraction</div>
                <div className="pipeline-value">{flow.miningProjects.length} projects</div>
                {flow.supplyTonnes && (
                  <div className="pipeline-tonnes">{flow.supplyTonnes.toLocaleString()} t/y projected</div>
                )}
              </div>

              <div className="pipeline-arrow">
                <div className={`arrow-line arrow-line--${flow.activeProcessors.length > 0 ? "active" : "broken"}`} />
                {flow.activeProcessors.length === 0 && flow.processingProjects.length === 0 && (
                  <span className="arrow-block">✕</span>
                )}
              </div>

              <div className="pipeline-stage">
                <div className="pipeline-label">Processing / Refining</div>
                <div className="pipeline-value">
                  {flow.activeProcessors.length > 0 ? (
                    <span className="pipeline-active">{flow.activeProcessors.length} active</span>
                  ) : (
                    <span className="pipeline-zero">0 active</span>
                  )}
                  {flow.processingProjects.length > 0 && (
                    <span className="pipeline-proposed"> + {flow.processingProjects.length} proposed</span>
                  )}
                </div>
                {flow.processingCapacity !== null && (
                  <div className="pipeline-tonnes">
                    {flow.processingCapacity === 0
                      ? "0 t/y capacity"
                      : `~${flow.processingCapacity.toLocaleString()} t/y capacity`}
                  </div>
                )}
              </div>

              <div className="pipeline-arrow">
                <div className={`arrow-line arrow-line--${flow.gapSeverity === "adequate" ? "active" : "weak"}`} />
              </div>

              <div className="pipeline-stage">
                <div className="pipeline-label">Battery / End Use Demand</div>
                {flow.demandTonnes && (
                  <div className="pipeline-value">{flow.demandTonnes.toLocaleString()} t/y needed</div>
                )}
                <div className="pipeline-tonnes">{flow.demandSource}</div>
              </div>
            </div>

            <div className="flow-insight">{flow.insight}</div>

            {(flow.miningProjects.length > 0 || flow.dataReferences.length > 0) && (
              <details className="flow-details">
                <summary>
                  View {flow.miningProjects.length + flow.processingProjects.length + flow.activeProcessors.length} projects & sources
                </summary>
                <div className="flow-project-list">
                  {flow.activeProcessors.map((p) => (
                    <span key={p.id} className="flow-project-tag flow-project-tag--active">{p.name}</span>
                  ))}
                  {flow.miningProjects.map((p) => (
                    <span key={p.id} className="flow-project-tag">{p.name}</span>
                  ))}
                  {flow.processingProjects.map((p) => (
                    <span key={p.id} className="flow-project-tag flow-project-tag--proposed">{p.name}</span>
                  ))}
                </div>
                <div className="flow-references">
                  <strong>Data sources:</strong>
                  <ul>
                    {flow.dataReferences.map((ref, i) => (
                      <li key={i}>{ref}</li>
                    ))}
                  </ul>
                </div>
              </details>
            )}
          </div>
        ))}
      </div>

      <div className="bottleneck-key-finding">
        <h3>Key Finding</h3>
        <p>
          Ontario is building <strong>3 EV battery gigafactories</strong> (NextStar, PowerCo, Honda) that need
          nickel, lithium, cobalt, and graphite. The province has <strong>35 mining/processing projects</strong> for
          these minerals — but the <strong>processing middle is missing</strong>. Raw ore will leave Ontario
          for refining elsewhere unless proposed processing facilities are built by 2027–2029.
        </p>
        <div className="finding-stats">
          <div className="finding-stat">
            <span className="finding-number">16</span>
            <span className="finding-label">Nickel mining projects</span>
          </div>
          <div className="finding-stat">
            <span className="finding-number">2</span>
            <span className="finding-label">Active nickel processors</span>
          </div>
          <div className="finding-stat">
            <span className="finding-number">0</span>
            <span className="finding-label">Active lithium refineries</span>
          </div>
          <div className="finding-stat">
            <span className="finding-number">0</span>
            <span className="finding-label">Active graphite processors</span>
          </div>
        </div>
      </div>
    </div>
  );
}
