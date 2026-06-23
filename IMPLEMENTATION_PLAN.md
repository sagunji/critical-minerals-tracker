# Critical Minerals Tracker — Implementation Plan

## Phase 1: Data Collection & Curation (Foundation)

**Goal:** Gather 20–30 real critical mineral project records from open government sources, validate them, and structure them into clean JSON.

| Step | Task | Output |
|------|------|--------|
| 1.1 | Scrape Ontario Geological Survey (OGS) for Northern Ontario mine sites | Raw CSV/GeoJSON records |
| 1.2 | Scrape NRCan Critical Minerals Inventory for Ontario projects | Raw CSV records |
| 1.3 | Cross-reference and deduplicate OGS + NRCan records | Unified project list |
| 1.4 | Enrich records with supplementary data (SEDAR filings, press releases) | Investment figures, resource estimates |
| 1.5 | Structure final dataset into `minerals.json` | 20–30 curated records with GPS, mineral type, stage, operator |
| 1.6 | Research and build supply chain links for 8–10 flagship projects | `supplychain.json` |
| 1.7 | Document all data sources with URLs, access dates, and licensing | `DATA_SOURCES.md` |

**Deliverables:**
- `data/minerals.json` — curated project records
- `data/supplychain.json` — mine-to-EV supply chain links
- `docs/DATA_SOURCES.md` — provenance documentation

---

## Phase 2: Project Scaffolding & Map (Core UI)

**Goal:** Set up the React app with Leaflet.js and render all 20–30 projects as interactive map pins.

| Step | Task | Output |
|------|------|--------|
| 2.1 | Initialize React project (Vite + TypeScript) | Boilerplate app |
| 2.2 | Install dependencies (Leaflet, React-Leaflet, D3) | `package.json` configured |
| 2.3 | Create map component with OpenStreetMap tiles centered on Northern Ontario | Base map rendering |
| 2.4 | Load `minerals.json` and render project pins on the map | Clickable markers |
| 2.5 | Implement pin clustering for dense regions | Clean UX at all zoom levels |
| 2.6 | Add mineral-type color coding to pins | Visual differentiation |
| 2.7 | Style the base layout (header, sidebar, map area) | Responsive shell |

**Deliverables:**
- Working React app with interactive map
- All 20–30 projects rendered as colored, clustered pins
- Responsive layout shell

---

## Phase 3: Project Detail Panel & Filters (Interactivity)

**Goal:** Allow users to click pins for details and filter the map by mineral type, stage, and operator.

| Step | Task | Output |
|------|------|--------|
| 3.1 | Build slide-out project detail panel (click a pin → see full info) | Detail card UI |
| 3.2 | Display: mineral type, GPS, development stage, operator, investment status | Structured card layout |
| 3.3 | Add filter sidebar: mineral type (checkbox), stage (dropdown), operator (search) | Filter controls |
| 3.4 | Implement filter logic — update visible map pins in real-time | Reactive filtering |
| 3.5 | Add "Reset filters" and active filter indicators | Clear UX feedback |
| 3.6 | Mobile-responsive detail panel (bottom sheet on mobile) | Works on any device |

**Deliverables:**
- Click-to-expand detail panel for every project
- Three-axis filtering (mineral, stage, operator)
- Mobile-friendly layout

---

## Phase 4: Supply Chain Visualization (Differentiator)

**Goal:** Show the mine-to-EV flow for flagship projects using an interactive diagram.

| Step | Task | Output |
|------|------|--------|
| 4.1 | Design the supply chain flow layout (mine → processor → battery → EV) | Wireframe/mockup |
| 4.2 | Build D3.js or SVG-based flow diagram component | Reusable viz component |
| 4.3 | Connect diagram to `supplychain.json` data | Data-driven rendering |
| 4.4 | Trigger diagram from project detail panel ("View supply chain" button) | Integrated UX flow |
| 4.5 | Add hover tooltips on each supply chain node | Context on each step |
| 4.6 | Animate the flow path (subtle animation showing direction) | Visual polish |

**Deliverables:**
- Interactive supply chain diagram for 8–10 projects
- Accessible from project detail panel
- Animated flow with tooltips

---

## Phase 5: Dashboard & Statistics (Context)

**Goal:** Add a summary stats panel showing aggregate data about the ecosystem.

| Step | Task | Output |
|------|------|--------|
| 5.1 | Calculate summary stats from `minerals.json` (counts by mineral, stage, investment) | Derived metrics |
| 5.2 | Build stats bar/cards (total projects, total investment, mineral breakdown) | Dashboard UI |
| 5.3 | Add a simple bar/donut chart for mineral distribution | Data viz |
| 5.4 | Add stage breakdown chart (exploration → development → production) | Pipeline view |
| 5.5 | Make dashboard responsive and collapsible | Clean on all screens |

**Deliverables:**
- Summary statistics dashboard
- Charts for mineral distribution and development stages
- Responsive layout

---

## Phase 6: Polish, Deploy & Demo Prep (Ship It)

**Goal:** Final polish, performance optimization, deployment, and demo preparation.

| Step | Task | Output |
|------|------|--------|
| 6.1 | Performance audit (lazy loading, bundle size, map tile caching) | Fast load times |
| 6.2 | Accessibility pass (keyboard navigation, screen readers, contrast) | WCAG compliance |
| 6.3 | SEO and meta tags (Open Graph for social sharing) | Shareable URL previews |
| 6.4 | Deploy to Vercel with custom domain (if available) | Live public URL |
| 6.5 | Write README with project overview and local dev setup | Developer docs |
| 6.6 | Prepare 3-minute demo script for judges | Presentation ready |
| 6.7 | Final cross-device QA (desktop, tablet, mobile) | Bug-free experience |

**Deliverables:**
- Live deployed app at a shareable URL
- README and documentation
- Demo script for hackathon presentation

---

## Timeline (Hackathon Day)

| Time Block | Phase | Focus |
|-----------|-------|-------|
| Pre-hackathon | Phase 1 | Data already collected and validated |
| Hour 0–1 | Phase 2 | Scaffold app, get map rendering |
| Hour 1–3 | Phase 3 | Detail panels and filters working |
| Hour 3–5 | Phase 4 | Supply chain visualization |
| Hour 5–6 | Phase 5 | Dashboard stats |
| Hour 6–7 | Phase 6 | Polish, deploy, prep demo |

---

## Current Status

- [x] Project document finalized
- [ ] **Phase 1: Data Collection** ← WE ARE HERE
- [ ] Phase 2: Map & Scaffolding
- [ ] Phase 3: Filters & Detail Panel
- [ ] Phase 4: Supply Chain Viz
- [ ] Phase 5: Dashboard
- [ ] Phase 6: Deploy & Demo
