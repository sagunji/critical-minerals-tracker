import type { SupplyChain } from "../types";

interface SupplyChainDiagramProps {
  chain: SupplyChain;
}

const STAGE_ICONS: Record<string, string> = {
  Mining: "⛏️",
  Milling: "🏭",
  Processing: "🔧",
  Concentrating: "🔬",
  "Smelting & Refining": "🔥",
  Refining: "⚗️",
  "Battery Manufacturing": "🔋",
  "EV Assembly": "🚗",
};

export default function SupplyChainDiagram({ chain }: SupplyChainDiagramProps) {
  return (
    <div className="supply-chain-diagram">
      {chain.chain.map((step, index) => (
        <div key={step.step} className="supply-chain-step">
          <div className="step-connector">
            <div className="step-dot" />
            {index < chain.chain.length - 1 && <div className="step-line" />}
          </div>
          <div className="step-content">
            <div className="step-header">
              <span className="step-icon">{STAGE_ICONS[step.stage] || "📍"}</span>
              <span className="step-stage">{step.stage}</span>
            </div>
            <div className="step-entity">{step.entity}</div>
            <div className="step-location">{step.location}</div>
            <div className="step-output">
              <span className="output-label">Output:</span> {step.output}
            </div>
            <div className="step-description">{step.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
