# Data Sources Documentation

## Critical Minerals Tracker — Data Provenance

All data in this project is sourced from publicly available government databases, corporate disclosures, and verified news sources. This document records exactly where each piece of data was found.

---

## Primary Sources

### 1. Natural Resources Canada (NRCan) — Critical Minerals Inventory

| Field | Value |
|-------|-------|
| Dataset | Critical minerals advanced projects, mines and processing facilities in Canada |
| Publisher | Natural Resources Canada |
| URL | https://open.canada.ca/data/en/dataset/22b2db8a-dc12-47f2-9737-99d3da921751 |
| API Endpoint | https://maps-cartes.services.geo.ca/server_serveur/rest/services/NRCan/critical_minerals_en/MapServer/ |
| Format | ESRI REST Service (ArcGIS MapServer) |
| Last Updated | February 27, 2026 |
| Licence | Open Government Licence — Canada |
| Access Date | June 22, 2026 |

**Layers queried:**
- Layer 0: Advanced exploration projects (24 Ontario records)
- Layer 2: Mines and other primary producing sites (11 Ontario records)
- Layer 3: Processing facilities (8 Ontario records)

**Fields extracted:** PropertyNameEN, OperatorOwnersEN, ProvincesEN, CommoditiesEN, DevelopmentStageEN, ActivityStatusEN, Latitude, Longitude, Website

**Query used:**
```
WHERE ProvincesEN LIKE '%Ontario%'
outFields=*&returnGeometry=true&outSR=4326&f=json
```

---

### 2. Ontario Geological Survey (OGS) — Ontario Mineral Inventory (OMI)

| Field | Value |
|-------|-------|
| Dataset | Ontario Mineral Inventory (formerly Mineral Deposit Inventory) |
| Publisher | Ontario Ministry of Mines |
| URL | https://data.ontario.ca/dataset/mineral-deposit-inventory-of-ontario |
| API Endpoint | https://ws.lioservices.lrc.gov.on.ca/arcgis2/rest/services/GeologyOntario/GeologyOntario_Map/MapServer/46 |
| Format | ESRI REST Service (ArcGIS MapServer) — Layer 46: OMEIS Mineral Inventory |
| Last Updated | April 1, 2026 |
| Licence | Ontario Open Data Terms of Use |
| Access Date | June 22, 2026 |

**Fields extracted:** NAME, STATUS, PRIMARY_COMMODITIES, SECONDARY_COMMODITIES, RGP_DISTRICT, CLASS, geometry (lat/long)

**Query used:**
```
WHERE (PRIMARY_COMMODITIES LIKE '%Nickel%' OR '%Lithium%' OR '%Cobalt%' OR '%Chromite%')
AND (STATUS LIKE '%Producing%' OR '%Developed%')
```

**Used for:** Cross-referencing and validating mine site locations and status from the NRCan dataset.

---

## Supplementary Sources

### 3. Canada.ca — Major Projects Office

| Field | Value |
|-------|-------|
| URL | https://www.canada.ca/en/privy-council/major-projects-office/projects/national/crawford.html |
| Used for | Crawford Nickel Project — investment figures ($5B), job creation (5,000 construction / 1,300 operational), 40-year mine life, net-zero claims |
| Access Date | June 22, 2026 |

### 4. Impact Assessment Agency of Canada (IAAC)

| Field | Value |
|-------|-------|
| URL | https://aeic-iaac.gc.ca/050/evaluations/proj/83857 |
| Used for | Crawford Nickel Project — federal assessment status, 240,000 t/day production capacity, 42km north of Timmins location |
| Access Date | June 22, 2026 |

### 5. Wyloo Pty Ltd — Eagle's Nest Fact Sheet Q2 2025

| Field | Value |
|-------|-------|
| URL | https://wyloo.com/wp-content/uploads/2025/07/20250701-WylooROF-Fact-Sheet.pdf |
| Used for | Eagle's Nest — 17-year mine life, 15,000 t/y nickel, 6,000 t/y copper, 70,000 oz palladium, 22,000 oz platinum, 340 t cobalt, ~1km surface footprint |
| Access Date | June 22, 2026 |

### 6. Ontario.ca — Eagle's Nest Multi-Metal Mine

| Field | Value |
|-------|-------|
| URL | https://ontario.ca/page/eagles-nest-multi-metal-mine |
| Used for | Eagle's Nest — EA status update (Protect Ontario Act 2025 terminated voluntary EA agreement), 11M tonnes resources at Wyloo ownership confirmation |
| Access Date | June 22, 2026 |

### 7. Canadian Mining Journal — Update on Top Critical Mining Projects in Ontario

| Field | Value |
|-------|-------|
| URL | https://www.canadianminingjournal.com/featured-article/update-on-top-critical-mining-projects-in-ontario/ |
| Used for | Crawford — 3.8M tonnes nickel reserve, 48,000 t/y production, 41-year lifespan; PAK Lithium — Mitsubishi JV, 24-year mine life, 23,174 t/y LiOH, $2.2B NPV, $608M Phase 1 capex |
| Access Date | June 22, 2026 |

### 8. Ontario Mining Association — Economic Research Report (March 2025)

| Field | Value |
|-------|-------|
| URL | https://www.oma.on.ca/media/jy3f0tgd/oma-economic-published-march-2025-final.pdf |
| Used for | 36 active mining operations in Ontario; mine construction status for KGHM Victoria ($1.0B), Glencore Onaping Depth ($1.5B), Magna Crean Hill ($48M), Vale Stobie ($205M); 30 mining projects pipeline |
| Access Date | June 22, 2026 |

### 9. Vale Base Metals — Sudbury Operations

| Field | Value |
|-------|-------|
| URL | https://valebasemetals.com/our-operations/sudbury/ |
| Used for | Vale mine names (Coleman, Creighton, Copper Cliff, Garson, Totten, Stobie), Clarabelle Mill, Copper Cliff Smelter (1930), Copper Cliff Nickel Refinery (1973), product descriptions |
| Access Date | June 22, 2026 |

### 10. Glencore Canada — Sudbury INO Community Report (Spring 2024)

| Field | Value |
|-------|-------|
| URL | https://www.glencore.ca/.rest/api/v1/documents/468328ed794e5c511e54a03aeb6f5222/Glencore+Sudbury+INO+-+SPRING+2024+-+OUR+REPORT+TO+THE+COMMUNITY+-+WEB.pdf |
| Used for | Onaping Depth — 15M tonnes ore at 2,500m depth, operational to 2040+, electric vehicles underground, 40% ventilation reduction; Nickel Rim South care & maintenance 2024; Fraser closure 2025 |
| Access Date | June 22, 2026 |

### 11. Timmins Press — Wyloo Ring of Fire Value Proposition

| Field | Value |
|-------|-------|
| URL | https://www.timminspress.com/business-economy/wyloo-ring-of-fire-lays-out-value-proposition-for-eagles-nest-mine |
| Used for | Eagle's Nest — 17M tonnes at 3.3% Ni-Cu-PGE, production target 2030, MOU with City of Sudbury for battery metals facility, $100M Indigenous contracts commitment |
| Access Date | June 22, 2026 |

### 12. Mining and Energy Canada — Top Active Mines in Ontario 2026

| Field | Value |
|-------|-------|
| URL | https://www.miningandenergy.ca/read/top-active-mines-in-ontario |
| Used for | Vale-Glencore copper venture (880,000 t copper over 21 years, US$1.6–2.0B), Vale mine inventory confirmation, Glencore transition details |
| Access Date | June 22, 2026 |

---

## Supply Chain Sources

The supply chain layer (`supplychain.json`) is hand-curated from:

1. **Wyloo MOU with City of Sudbury** — battery metals processing facility partnership (Source: Timmins Press, Sept 2024)
2. **NextStar Energy (Stellantis-LG)** — Windsor EV battery plant, first large-scale Canadian battery plant (public announcements)
3. **PowerCo SE (Volkswagen)** — $7B St. Thomas gigafactory targeting 2027 production (public announcements)
4. **GM Ultium platform** — supply chain relationship with Vale for nickel (public corporate disclosures)
5. **POSCO Future M** — cathode materials partnership with GM in Bécancour, Quebec (public announcements)
6. **Glencore-Umicore-BMW** — European battery metals supply chain (Glencore corporate disclosures)
7. **Frontier Lithium-Mitsubishi JV** — March 2024 joint venture announcement (Canadian Mining Journal)

---

## Data Licensing

| Source | Licence |
|--------|---------|
| NRCan | Open Government Licence — Canada |
| Ontario Geological Survey | Ontario Open Data Terms of Use |
| IAAC | Government of Canada open information |
| Corporate sources | Publicly available press releases and filings |

All data used in this project is publicly available under open government licences or from public corporate disclosures. No proprietary or restricted data is used.

---

## Data Currency

- **NRCan dataset last updated:** February 27, 2026
- **OGS dataset last validated:** April 30, 2026
- **Data compiled for this project:** June 22, 2026

This dataset represents a point-in-time snapshot. For the latest information, consult the primary sources directly.
