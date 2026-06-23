# Critical Minerals Tracker

**Project document — Build the North Hackathon**
Track 03: Mining & Industrial Innovation
Cliff Fielding Research, Innovation and Engineering Building, Laurentian University
Saturday, June 27, 2025

---

| | |
|---|---|
| Project name | Critical Minerals Tracker |
| Track | 03 — Mining & Industrial Innovation |
| Theme | Build the North — Northern Ontario Opportunities |
| Event date | Saturday, June 27, 2025 |
| Location | Laurentian University, Sudbury ON |
| Presented by | Cursor Sudbury Community |

---

## 1. The problem

Northern Ontario sits on one of the richest deposits of critical minerals in the world — lithium, nickel, cobalt, copper, and rare earths that are essential to EV batteries, clean energy grids, and national security. Over $4 billion has been invested in the region since 2020, and that number is accelerating.

Yet there is no single public platform that shows where these projects are, what is being extracted, who owns them, and how they connect to the global battery supply chain.

The data exists — but it is buried across dozens of provincial databases, federal filings, company reports, and news sources. The result:

- **Investors:** cannot quickly assess the Northern Ontario opportunity landscape.
- **Communities:** cannot see what is being developed in their backyard or who benefits.
- **Policymakers:** cannot identify gaps or bottlenecks in the regional supply chain.
- **Businesses:** local businesses miss contract opportunities because they cannot see who is operating nearby.

---

## 2. The solution

The Critical Minerals Tracker is a public intelligence platform that consolidates, visualizes, and contextualizes Northern Ontario's critical minerals ecosystem in one place.

### Core features

- Interactive map of all active critical mineral projects across Northern Ontario, filterable by mineral type, development stage, and operator.
- Project detail cards showing mineral type, GPS coordinates, development stage, operator, investment status, and supply chain links.
- Supply chain visualization tracing the path from Northern Ontario ore → processor → battery cell manufacturer → EV brand.
- Summary statistics dashboard showing total projects by mineral, total investment, and stage breakdown.

The platform is public, free to access, and designed to be updated as new projects come online.

---

## 3. Goals & objectives

### Primary goal

Make Northern Ontario's critical minerals ecosystem legible to investors, communities, and policymakers for the first time in a single platform.

### Hackathon objectives

- Deliver a working interactive map with 20–30 real Northern Ontario critical mineral projects loaded from open government data.
- Demonstrate the mine-to-market supply chain for at least 5 key projects (e.g. Ring of Fire nickel → Vale → battery cathode → GM Ultium).
- Ship a clean, shareable URL that judges and community members can open on any device.

### Post-hackathon objectives (v2 roadmap)

- Integrate live project status updates via NRCan API feeds.
- Add Indigenous land and treaty layer in partnership with First Nations communities.
- Build an investment opportunity filter for accredited investors.
- Add real-time commodity price tickers (nickel, lithium, cobalt).

---

## 4. Who is it for?

| User | What they need | How the tracker helps |
|---|---|---|
| Investors & funds | Quickly identify viable projects and market gaps | Filterable map by stage, mineral, and operator |
| Northern Ontario communities | Understand what is being developed near them | Map pins with local context and project details |
| Federal & provincial policymakers | Spot supply chain gaps and policy priorities | Supply chain view from mine to EV manufacturer |
| Local businesses & contractors | Identify who is operating near them for contracts | Operator names and project status on every pin |

---

## 5. Data sources

### Primary sources (open government data)

- Ontario Geological Survey (OGS) — mine site locations, mineral types, project status, GPS coordinates. Available as GeoJSON and CSV at ontario.ca/data.
- Natural Resources Canada (NRCan) Critical Minerals Inventory — national project list with province, mineral, company, and development stage. Available at open.canada.ca.

### Supplementary sources

- SEDAR public filings (NI 43-101 technical reports) — used to extract resource estimates and investment figures for publicly listed junior miners.
- Mining.com and company press releases — used to validate project status and identify supply chain partnerships.

### Hand-curated supply chain layer

No API exists for mine-to-EV supply chain links. This layer is manually researched and hardcoded as a JSON file — connecting 8–10 flagship Northern Ontario projects to their downstream processors, battery cell manufacturers, and EV brands. This is the platform's key differentiator.

### Hackathon data strategy

Rather than attempting to load all Ontario mineral data, the hackathon build curates 20–30 high-quality records from OGS and NRCan, cleans and enriches them, and stores them in a single minerals.json file. No database required. This ensures a fast, reliable demo on the day.

---

## 6. Validation

### Problem validation

- Canada's Critical Minerals Strategy (2022) identifies data fragmentation as a core barrier to investment and community engagement.
- The Ontario Chamber of Commerce has flagged lack of supply chain visibility as a blocker for Northern Ontario economic development.
- No equivalent public platform exists for Northern Ontario specifically — validated by direct search of NRCan, OGS, and Ontario.ca portals.

### Solution validation (hackathon day)

- Show the OGS and NRCan datasets to judges as proof that real data underpins the map — not invented or synthetic records.
- Demo the supply chain flow live for the Ring of Fire nickel cluster: project → Vale processing → cathode → GM Ultium platform.
- Reference $4B+ in publicly announced investments as evidence of the market need.

### Post-hackathon validation path

- Partner with Cursor Sudbury to share the platform with local mining industry contacts for feedback.
- Reach out to the Ontario Ministry of Mines and Northern Development for data partnership.
- Present to Invest Ontario and DEEP Centre for potential continuation funding.

---

## 7. Technical approach

### Frontend

- React (or plain HTML/JS) single-page application deployed on Vercel or GitHub Pages.
- Leaflet.js for the interactive map layer using OpenStreetMap tiles (zero cost, zero signup).
- GeoJSON rendered as map pins, clustered by region for performance.
- Click-to-expand project detail panel for each mine site.

### Data layer

- Single minerals.json file (20–30 curated records) sourced from OGS + NRCan open data.
- Supply chain links stored as a second supplychain.json with project ID references.
- No backend or database required for the hackathon build.

### Supply chain visualization

- D3.js or a simple custom SVG flow diagram showing the mine → processor → battery → EV chain for a selected project.
- Triggered from the project detail panel when a supply chain link exists.

### Stack summary

| Layer | Technology |
|---|---|
| Map rendering | Leaflet.js + OpenStreetMap tiles |
| Frontend framework | React or HTML/JS (team preference) |
| Supply chain diagram | D3.js or custom SVG flow |
| Data storage | Static JSON files (minerals.json, supplychain.json) |
| Hosting & deployment | Vercel or GitHub Pages (free, instant deploy) |

---

## 8. The selling point

> "Right now, billions are flowing into critical minerals in Northern Ontario — but there's no single place to see it. We built the map that shows every active project, what's being mined, what stage it's at, and how it connects to the EV battery supply chain. Communities can track what's in their backyard. Investors can scout opportunities. Policymakers can spot gaps. One map. Three audiences."

### Why this wins

- **Timing:** Canada's Critical Minerals Strategy, the EV boom, and Ring of Fire investment make this the most relevant economic story in Northern Ontario right now.
- **Visual impact:** an interactive map with supply chain flows is memorable. Judges will still be thinking about it when they vote.
- **Real data:** built on open government datasets, not invented records. Credibility is instant.
- **Genuine gap:** no equivalent platform exists for Northern Ontario. This is not a slightly better version of something — it is the first of its kind.
- **Three audiences in one:** investors, communities, and policymakers all have a reason to use it. Most hackathon projects serve one user. This serves three.
- **Continuable:** clear v2 roadmap (live data feeds, Indigenous land layer, investment filters) shows judges a real product trajectory, not a one-day prototype.