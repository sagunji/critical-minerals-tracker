# Pragmatic Feature Proposals

## Context

The current build has: interactive map, filters, detail panels, supply chain diagrams, and a dashboard. These are solid but somewhat generic for a "data on a map" project.

Below are features that would make this **genuinely useful** to the three target audiences — not just impressive to hackathon judges.

---

## Tier 1: High-Impact, Buildable in Hours

### 1. "What's Near Me" Proximity Search
**For:** Local businesses, communities, contractors  
**What:** Enter a town name (Sudbury, Timmins, Thunder Bay, Kenora) or click a point on the map → show all projects within 50/100/200km radius with distance labels.  
**Why it's pragmatic:** A contractor in Timmins doesn't care about the full provincial map — they want to know what's hiring within driving distance. This is the #1 question local businesses actually ask.  
**Effort:** ~2 hours (geocode a list of Northern Ontario towns, add a distance calculation, filter results)

### 2. Project Timeline / Status Tracker
**For:** Investors, policymakers  
**What:** Each project shows a simple pipeline bar: Exploration → Feasibility → Permitting → Construction → Production. Color the current stage. Show key dates (permit received, construction start, expected production).  
**Why it's pragmatic:** The biggest question investors ask is "when does this become real?" — not "where is it on a map." Stage + timeline is more actionable than GPS coordinates.  
**Effort:** ~2 hours (add `timeline` field to data, build a simple step indicator component)

### 3. Investment Heatmap / Totals by Region
**For:** Policymakers, investors  
**What:** Aggregate investment dollars by district/region and show as a choropleth or sized circles. "The Sudbury Basin has $8.7B in active/planned investment. Timmins corridor has $5.2B."  
**Why it's pragmatic:** Policymakers think in regional economic impact, not individual project pins. This answers "which region needs more infrastructure investment?"  
**Effort:** ~1.5 hours (aggregate existing investmentCAD data by region, render as sized markers or a simple heatmap overlay)

### 4. CMIF Funding Layer (Government Money Tracker)
**For:** Policymakers, companies seeking funding  
**What:** We already have the Ontario Critical Minerals Innovation Fund CSV (29 recipients, $12M+). Overlay which projects received government funding, how much, and for what. "This project received $500K from CMIF Intake 2 for nickel sulfate processing."  
**Why it's pragmatic:** Shows public investment flowing into the ecosystem. For companies: "who else got funded and for what?" For government: "where is our money going?"  
**Effort:** ~1.5 hours (cross-reference CMIF CSV with existing project list, add funding badge/tooltip)

### 5. Export / Share a Project
**For:** All users  
**What:** "Share this project" button that generates a direct URL (e.g., `/project/crawford`) + a "Download PDF summary" or "Copy to clipboard" button for the project detail card.  
**Why it's pragmatic:** An investor who finds something interesting needs to share it with their team. A community member wants to send it to their council. A clean shareable link is how real platforms get traction.  
**Effort:** ~1 hour (URL routing + clipboard API)

---

## Tier 2: Medium Effort, Strong Differentiator

### 6. "Jobs & Contracts" Estimate Layer
**For:** Communities, local businesses  
**What:** For projects with data, show estimated jobs (construction + operational). Crawford = 5,000 construction + 1,300 operational. Eagle's Nest = 150-200 construction. Roll up to regional totals: "Northern Ontario mining projects represent an estimated 15,000+ future jobs."  
**Why it's pragmatic:** Jobs are the #1 thing communities and politicians care about. Not mineral grades.  
**Effort:** ~3 hours (research job estimates from IAAC/corporate filings, add to data, build UI)

### 7. "Canada vs. China" Supply Chain Risk View
**For:** Policymakers, investors  
**What:** For each critical mineral (nickel, lithium, cobalt, graphite, REE), show a simple gauge: "% of global processing currently done in China" vs. "Ontario's proposed capacity." Makes the strategic argument visual.  
**Why it's pragmatic:** This is the single biggest reason governments are funding these projects. Making it visual is devastatingly effective for a presentation.  
**Effort:** ~3 hours (research USGS/IEA data on processing concentration, build a comparison viz)

### 8. News Feed / Recent Developments
**For:** Investors, all users  
**What:** A curated timeline of recent events: "May 2025 — Crawford clears federal permitting hurdle." "May 2025 — Marathon receives final construction permit." "Oct 2024 — Electra fully funded at $111M."  
**Why it's pragmatic:** A static map is a snapshot. A platform with recent developments feels alive and worth bookmarking.  
**Effort:** ~2 hours (manually curate 15-20 recent headline events, build a simple timeline component)

### 9. Mineral Price Context Sidebar
**For:** Investors  
**What:** Show current commodity prices for nickel, lithium, cobalt, copper alongside the map. Not live-streaming tickers (too complex) — just a static "as of June 2025" panel with 1-year trend direction (↑↓→).  
**Why it's pragmatic:** Investors always ask "is now a good time?" Price context makes project economics meaningful.  
**Effort:** ~1.5 hours (research current LME/CME prices, build a small sidebar component)

### 10. Indigenous Community Context Layer
**For:** Communities, policymakers, operators  
**What:** Overlay treaty boundaries and First Nations communities near project sites. Not a full land rights database — just: "Eagle's Nest is on traditional territory of Marten Falls First Nation and Webequie First Nation. Wyloo has committed $100M in contracts to these communities."  
**Why it's pragmatic:** Every single mining project in Northern Ontario interacts with Indigenous communities. Ignoring this makes the platform feel incomplete. Acknowledging it makes it responsible.  
**Effort:** ~4 hours (source treaty boundary GeoJSON from Government of Canada, add a toggle layer, add community names to relevant project records)

---

## Tier 3: Post-Hackathon (v2)

### 11. Live NRCan API Refresh
Auto-refresh data from NRCan ArcGIS REST API weekly.

### 12. Investor Comparison Tool
Select 2-3 projects side-by-side: compare minerals, investment, timeline, stage, supply chain.

### 13. PDF Report Generator
One-click export of a "Northern Ontario Critical Minerals Landscape Report" — useful for board presentations.

### 14. Community Alert Signup
"Notify me when a project within 100km of Timmins changes status." Email-based.

---

## My Recommendation for Hackathon Day

Build these 4 from Tier 1 (in order of impact):

1. **Project Timeline** — transforms a pin into a story
2. **CMIF Funding Layer** — we already have the data, just cross-reference
3. **"What's Near Me"** — makes it personal for community users
4. **Export/Share** — makes it spreadable

These four turn the platform from "a nice map" into "a tool people would actually use."
