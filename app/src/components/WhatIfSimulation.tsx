import { useState } from "react";

interface Scenario {
  id: string;
  title: string;
  description: string;
  trigger: string;
  consequences: string[];
  impact: "positive" | "negative" | "mixed";
  affectedProjects: string[];
  timeframe: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "crawford-approved",
    title: "Crawford Gets Federal Approval (Summer 2026)",
    description: "The Impact Assessment Agency of Canada issues a positive Decision Statement for Crawford. Construction begins late 2026.",
    trigger: "Federal permitting decision expected summer 2026",
    consequences: [
      "48,000 t/y nickel enters planning pipeline — larger than any existing Canadian nickel operation",
      "5,000 construction jobs needed in Timmins region 2026–2029",
      "New processing facility required — Vale/Glencore can't absorb this volume",
      "Ontario becomes world's #2 nickel reserve holder after Indonesia",
      "Attracts downstream investment: cathode material plants, battery recyclers",
    ],
    impact: "positive",
    affectedProjects: ["Crawford", "Canada Nickel Processing", "Stainless Steel Facility", "PowerCo St. Thomas"],
    timeframe: "2026–2030",
  },
  {
    id: "road-delayed",
    title: "Northern Road Link Delayed to 2037",
    description: "The infrastructure corridor to the Ring of Fire (Northern Road Link + Webequie Supply Road) faces further delays. Construction doesn't start until 2032.",
    trigger: "Construction timeline currently shows 2030–2035. Political/environmental challenges could push it further.",
    consequences: [
      "Eagle's Nest ($2B nickel deposit) stays dormant for 11+ more years",
      "15,000 t/y nickel + 6,000 t/y copper remains inaccessible",
      "Wyloo's proposed Sudbury processing facility becomes unviable without feedstock",
      "Windsor/St. Thomas battery plants source nickel from Indonesia/Philippines instead",
      "IRA/CUSMA compliance at risk — imported nickel may not qualify for EV tax credits",
      "$100M committed to Marten Falls & Webequie First Nations is delayed",
    ],
    impact: "negative",
    affectedProjects: ["Eagle's Nest", "Wyloo Battery Metals Facility"],
    timeframe: "2025–2037",
  },
  {
    id: "lithium-refineries",
    title: "Thunder Bay Lithium Hub Comes Online (2029)",
    description: "At least 2 of the 4 proposed lithium hydroxide refineries near Thunder Bay reach production. Frontier Lithium + one other.",
    trigger: "Frontier Lithium DFS complete May 2025, Mitsubishi JV financing in place",
    consequences: [
      "Ontario produces battery-grade lithium hydroxide domestically for the first time",
      "~35,000 t/y LiOH capacity covers 100%+ of provincial gigafactory demand",
      "Thunder Bay becomes a lithium processing cluster — workforce, infrastructure synergies",
      "Reduces Canadian dependence on Chinese lithium chemical imports (currently ~70%)",
      "Qualifies for IRA critical mineral sourcing requirements — enables US EV tax credits",
    ],
    impact: "positive",
    affectedProjects: ["PAK Lithium", "Frontier Lithium Refinery", "Rock Tech Refinery", "Avalon Lake Superior", "GT Metals Thunder Bay"],
    timeframe: "2027–2030",
  },
  {
    id: "electra-commissioning",
    title: "Electra Cobalt Refinery Begins Production (2027)",
    description: "North America's first and only battery-grade cobalt sulfate refinery in Temiskaming Shores completes commissioning and starts production.",
    trigger: "$111M financing secured Oct 2024. Mechanical completion target Q2 2027.",
    consequences: [
      "North America gains first domestic cobalt refining — currently 100% dependent on China/DRC chain",
      "5,120 t/y cobalt sulfate production (scaling to 6,500 t/y)",
      "Enables NMC cathode production in Ontario without imported Chinese cobalt",
      "Battery recycling facility co-located — circular economy for Ontario EV batteries",
      "US Dept of Defense funding ($20M) signals strategic/defense value beyond EV market",
    ],
    impact: "positive",
    affectedProjects: ["Electra Battery Materials", "Crawford (cobalt byproduct)"],
    timeframe: "2027–2028",
  },
  {
    id: "workforce-crunch",
    title: "Workforce Shortage Delays Multiple Projects (2027)",
    description: "8,000+ construction workers needed simultaneously in Sudbury-Timmins corridor. Labour market can't supply. Projects delay 12–18 months.",
    trigger: "Crawford, Onaping Depth, Victoria, Stobie, Crean Hill all in construction phase 2025–2028",
    consequences: [
      "Crawford construction pushes to 2028 start — first production slips to 2031+",
      "Glencore Onaping Depth ramp-up delayed — extends care-and-maintenance costs",
      "Labour costs escalate 20–30% due to competition between projects",
      "Indigenous employment commitments harder to fulfil without training pipeline lead time",
      "Ontario's 2030 production targets across multiple projects become unrealistic",
    ],
    impact: "negative",
    affectedProjects: ["Crawford", "Onaping Depth", "Victoria", "Stobie", "Crean Hill"],
    timeframe: "2026–2029",
  },
];

export default function WhatIfSimulation() {
  const [activeScenario, setActiveScenario] = useState<string>(SCENARIOS[0].id);

  const scenario = SCENARIOS.find((s) => s.id === activeScenario)!;

  return (
    <div className="simulation">
      <div className="simulation-header">
        <h2>What-If Scenarios</h2>
        <p className="simulation-subtitle">
          Explore how key decisions and events reshape Ontario's critical minerals future
        </p>
      </div>

      <div className="scenario-tabs">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            className={`scenario-tab ${activeScenario === s.id ? "active" : ""} scenario-tab--${s.impact}`}
            onClick={() => setActiveScenario(s.id)}
          >
            <span className="scenario-tab-icon">
              {s.impact === "positive" ? "↗" : s.impact === "negative" ? "↘" : "↔"}
            </span>
            <span className="scenario-tab-title">{s.title.split("(")[0].trim()}</span>
          </button>
        ))}
      </div>

      <div className="scenario-detail">
        <div className="scenario-title-bar">
          <h3>{scenario.title}</h3>
          <span className={`scenario-impact scenario-impact--${scenario.impact}`}>
            {scenario.impact === "positive" ? "↗ Positive" : scenario.impact === "negative" ? "↘ Negative" : "↔ Mixed"}
          </span>
        </div>

        <p className="scenario-description">{scenario.description}</p>

        <div className="scenario-trigger">
          <span className="trigger-label">Trigger:</span> {scenario.trigger}
        </div>

        <div className="scenario-timeframe">
          <span className="timeframe-label">Timeframe:</span> {scenario.timeframe}
        </div>

        <div className="scenario-consequences">
          <h4>Consequences</h4>
          <ul>
            {scenario.consequences.map((c, i) => (
              <li key={i} className="consequence-item">{c}</li>
            ))}
          </ul>
        </div>

        <div className="scenario-affected">
          <h4>Affected Projects</h4>
          <div className="affected-tags">
            {scenario.affectedProjects.map((p) => (
              <span key={p} className="affected-tag">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
