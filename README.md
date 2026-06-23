# Critical Minerals Tracker — Northern Ontario

An interactive public intelligence platform that maps, visualizes, and contextualizes Northern Ontario's critical minerals ecosystem. Built for the **Build the North Hackathon** (Track 03: Mining & Industrial Innovation).

## Live Features

- **Interactive Map** — 27 real critical mineral projects plotted with color-coded pins (by mineral type)
- **Filter & Search** — Filter by mineral type, development stage, or search by name/operator
- **Project Details** — Click any pin for full details: minerals, GPS, operator, investment, production targets
- **Supply Chain Visualization** — Mine-to-EV flow diagrams for 5 flagship projects (Eagle's Nest, Crawford, Vale Sudbury, Onaping Depth, PAK Lithium)
- **Dashboard** — Aggregate statistics on projects, investment, and mineral distribution

## Data Sources

All data is sourced from **real open government datasets** (not synthetic):

| Source | Records | Licence |
|--------|---------|---------|
| NRCan Critical Minerals Inventory (ArcGIS REST API) | 24 advanced projects + 11 mines + 8 processing facilities | Open Government Licence — Canada |
| Ontario Geological Survey / Ontario Mineral Inventory (ArcGIS REST) | Cross-reference validation | Ontario Open Data Terms of Use |
| Corporate disclosures (Wyloo, Canada Nickel, Vale, Glencore, Frontier Lithium) | Enrichment data (investment, production, supply chains) | Public filings & press releases |

Full provenance documentation: [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md)

## Quick Start

```bash
cd app
npm install
npm run dev
```

Open **http://localhost:5173** (or next available port).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Map | Leaflet.js + React-Leaflet + CARTO dark basemap |
| Data Viz | D3.js (available) + custom SVG |
| Data | Static JSON (no backend required) |
| Styling | Custom CSS (dark theme, responsive) |

## Project Structure

```
critical-minerals-tracker/
├── app/                          # React application
│   ├── public/data/              # Static JSON data files
│   │   ├── minerals.json         # 27 curated project records
│   │   └── supplychain.json      # 5 mine-to-EV supply chains
│   └── src/
│       ├── components/           # React components
│       │   ├── MineralMap.tsx     # Leaflet interactive map
│       │   ├── FilterPanel.tsx    # Sidebar filters
│       │   ├── ProjectDetail.tsx  # Project detail panel
│       │   ├── SupplyChainDiagram.tsx  # Flow visualization
│       │   └── Dashboard.tsx     # Stats dashboard
│       ├── hooks/useData.ts      # Data loading hook
│       ├── types/index.ts        # TypeScript types & constants
│       ├── App.tsx               # Main application
│       └── App.css               # Full styling
├── data/                         # Raw scraped data
│   ├── minerals.json             # Curated dataset (source of truth)
│   ├── supplychain.json          # Supply chain links
│   ├── nrcan_advanced_projects_raw.json
│   ├── nrcan_mines_raw.json
│   └── nrcan_processing_raw.json
├── docs/
│   └── DATA_SOURCES.md           # Full data provenance documentation
├── IMPLEMENTATION_PLAN.md        # Phased build plan
└── critical-minerals-tracker-project.md  # Project document
```

## Key Supply Chains Mapped

1. **Eagle's Nest → Wyloo Processing → NextStar (Stellantis-LG) → Stellantis EVs**
2. **Crawford Nickel → On-site Mill → PowerCo (VW Gigafactory) → Volkswagen EVs**
3. **Vale Sudbury Mines → Clarabelle Mill → Copper Cliff Smelter/Refinery → GM Ultium → GM EVs**
4. **Onaping Depth → Strathcona/Sudbury Smelter → Nikkelverk Norway → Umicore/Samsung → BMW/Volvo EVs**
5. **PAK Lithium → Concentrator → LiOH Refinery → Mitsubishi/Battery Makers → Global EV OEMs**
