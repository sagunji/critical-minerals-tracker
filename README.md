# Critical Minerals Tracker

Public intelligence platform for Northern Ontario's critical minerals ecosystem. Consolidates and visualizes 50+ active mining and processing projects sourced entirely from verifiable government data.

## Architecture

```
critical-minerals-tracker/
├── apps/
│   ├── web/          React + Vite + TypeScript (frontend)
│   └── api/          Python + FastAPI (REST API)
├── .github/workflows/
│   ├── deploy.yml    Deploy on push to main
│   └── sync_data.yml Weekly data refresh
└── pnpm-workspace.yaml
```

**Frontend:** React 19, Vite, TypeScript, Leaflet, pnpm  
**Backend:** Python 3.11+, FastAPI, Pydantic, uv  
**Data:** JSON files synced from NRCan + Ontario CMIF (no hand-curated data)

## Quick Start

### Prerequisites

- Node.js 22+ (via asdf: `asdf install`)
- pnpm 10+
- Python 3.11+
- [uv](https://docs.astral.sh/uv/) (Python package manager)

### Development

```bash
pnpm install
cd apps/api && uv sync && cd ../..

# Run both (API on :8000, Web on :5180 with proxy)
pnpm dev
```

Or run separately:

```bash
pnpm dev:api    # Backend only
pnpm dev:web    # Frontend only (requires API running)
```

### Data Sync

```bash
pnpm sync          # Run all sync scripts
pnpm sync:nrcan    # NRCan projects only
pnpm sync:cmif     # CMIF funding only
```

### Deploy

```bash
pnpm deploy        # Deploy both API + frontend
pnpm deploy:api    # Fly.io only
pnpm deploy:web    # Build + Cloudflare Pages
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/projects` | List all projects (filterable) |
| GET | `/api/projects/:id` | Single project detail |
| GET | `/api/stats/summary` | Aggregate statistics |
| GET | `/api/sources` | Data provenance metadata |
| POST | `/api/reload` | Clear data caches |

**Query filters on `/api/projects`:**
- `?mineral=Nickel` — filter by primary mineral
- `?stage=Advanced Project` — filter by development stage
- `?region=Sudbury` — filter by region (partial match)
- `?operator=Vale` — filter by operator (partial match)
- `?funded=true` — only government-funded projects

**Interactive docs:** http://localhost:8000/docs (Swagger UI)

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| API | Fly.io | https://critical-minerals-api.fly.dev |
| Frontend | Cloudflare Pages | https://critical-minerals-tracker.pages.dev |

### GitHub Actions Secrets Required

| Secret | Purpose |
|--------|---------|
| `FLY_API_TOKEN` | Fly.io deploy token (`flyctl tokens create deploy -x 999999h`) |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages edit permission |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID (from dashboard URL) |

### Setup

1. **Fly.io token:** `flyctl tokens create deploy -x 999999h`
2. **Cloudflare token:** Dashboard → My Profile → API Tokens → Create Token → "Edit Cloudflare Workers" template
3. **Cloudflare account ID:** Dashboard URL is `dash.cloudflare.com/<account-id>/...`
4. Add all three as repository secrets in GitHub → Settings → Secrets → Actions

## Data Sources

All projects are traceable to:
- **NRCan Critical Minerals Projects Database** (ArcGIS REST API) — primary source for project locations, operators, minerals, stages
- **Ontario CMIF Recipients** (Ontario Data Catalogue CKAN API) — government funding records

Sync metadata logged in `apps/api/src/data/sync_log.json` and `funding_metadata.json`.

## Features

- Interactive Leaflet map with mineral-colored markers
- Multi-criteria filtering (mineral, stage, region, operator, funding)
- Stats dashboard with project distribution by mineral, stage, and region
- Government funding badges with provenance
- Data source transparency (API `/sources` endpoint)
- Automated weekly data refresh via GitHub Actions
