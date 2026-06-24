# Critical Minerals Tracker

Public intelligence platform for Northern Ontario's critical minerals ecosystem. Consolidates, visualizes, and contextualizes 35 active mining and processing projects across the region.

## Architecture

```
critical-minerals-tracker/
├── apps/
│   ├── web/          React + Vite + TypeScript (frontend)
│   └── api/          Python + FastAPI (REST API)
├── docs/             Data source documentation
└── pnpm-workspace.yaml
```

**Frontend:** React 19, Vite, TypeScript, Leaflet, pnpm  
**Backend:** Python 3.11+, FastAPI, Pydantic, uv  
**Data:** JSON files (source of truth), enriched at API layer from NRCan, CMIF, and curated timelines

## Quick Start

### Prerequisites

- Node.js 22+ (via asdf: `asdf install`)
- pnpm 10+
- Python 3.11+
- [uv](https://docs.astral.sh/uv/) (Python package manager)

### Development

```bash
# Install frontend dependencies
pnpm install

# Install backend dependencies
cd apps/api && uv sync && cd ../..

# Run both (API on :8000, Web on :5180 with proxy)
pnpm dev
```

Or run separately:

```bash
# Backend only
pnpm dev:api

# Frontend only (requires API running)
pnpm dev:web
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/projects` | List all projects (filterable) |
| GET | `/api/projects/:id` | Single project detail |
| GET | `/api/supply-chains` | List supply chains |
| GET | `/api/supply-chains/:id` | Single supply chain |
| GET | `/api/stats/summary` | Aggregate statistics |

**Query filters on `/api/projects`:**
- `?mineral=Nickel` — filter by primary mineral
- `?stage=Advanced Project` — filter by development stage
- `?region=Sudbury` — filter by region (partial match)
- `?operator=Vale` — filter by operator (partial match)
- `?funded=true` — only government-funded projects
- `?has_supply_chain=true` — only projects with supply chain data

**Interactive docs:** http://localhost:8000/docs (Swagger UI)

## Data Sources

All 35 projects are traceable to:
- **NRCan Critical Minerals Projects Database** (ArcGIS REST API) — primary source
- **Ontario CMIF Recipients** — government funding records
- **Corporate filings & NI 43-101 reports** — investment and resource estimates

Full provenance documented in [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md).

## Features

- Interactive Leaflet map with mineral-colored markers
- Multi-criteria filtering (mineral, stage, region, operator, funding)
- Supply chain bottleneck analysis with quantitative gap scoring
- What-if scenario simulation for disruption modeling
- Combined stats & investment dashboard
- Project timelines and government funding badges
- Shareable deep links per project
