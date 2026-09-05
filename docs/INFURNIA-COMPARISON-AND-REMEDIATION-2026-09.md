# OUOBee Infra vs Infurnia — 2026-09 parity and remediation

## Scope

This audit compares the public Infurnia product claims with the current OUOBee Infra repository. It does not copy Infurnia source code, private implementation, branding, or proprietary assets. Public product behavior is treated only as a functional benchmark.

## Current parity

| Capability | Infurnia public capability | OUOBee Infra current state | Target / remediation |
|---|---|---|---|
| 2D CAD | Detailed 2D layouts, line/trim/offset, annotations | Foundation editor | Constraint-based CAD, dimensions, layers, trim/offset, snaps |
| 2D/3D synchronization | Plan/elevation/3D stay synchronized | Partial | One authoritative parametric model and synchronized viewports |
| 3D sketch | Pencil/shape/push-pull/curves | Missing/preview UI | Three.js geometry kernel + editable solids |
| BIM | Data-rich BIM, schedules, BOQ sync | IFC mapping foundation | Real IFC object graph, properties, relationships, round-trip tests |
| Architecture | Walls, slabs, structural components, doors/windows | Basic walls/rooms/openings | Full building element families |
| Interior | Walls, tiles, ceilings, lights, furniture, materials | Catalog starter | Material/finish/ceiling/lighting engine |
| Modular kitchen | Modular design and custom components | Starter | Parametric cabinet/wardrobe/component families |
| Custom catalog | Personal/company 3D/material catalogs | Starter | Asset ingestion, metadata, versioning, permissions |
| Smart placement | Auto rotation/collision avoidance | Partial geometry utilities | Constraint-aware placement and clearance rules |
| Rendering | 2D/3D photorealistic and parallel cloud rendering | Preview | Worker-based renderer with job states and output validation |
| 360 panorama | 360° panorama/virtual tour | Missing | Equirectangular render pipeline and viewer |
| VR | VR visualization | Missing | WebXR scene/export layer |
| Working drawings | Auto floor plans/elevations/dimensions | Basic documents | Drawing templates, dimensions, sections, elevations, schedules |
| BOQ/BOM | One-click real-time BOQ/BOM | Basic quantities | Authoritative quantity extraction, materials, hardware, labour |
| Pricing | Configurable quotations, discounts, charges, taxes, layouts, PDF/CSV/XLSX | Basic engine foundation | Full rule/template engine and exports |
| Collaboration | Real-time collaboration/admin/project hub | UI only | Authenticated backend, presence, WebSocket sync, conflict resolution |
| Production QC | Manufacturing verification gate | Validation foundation | Deterministic manufacturability rules and blocking gates |
| Cutlist | Panel listing/cutlists | Engine added | Integrate with parametric cabinet assemblies and fixtures |
| Board nesting | Optimized board layouts/utilization | Engine added | Production-grade guillotine/kerf/rotation optimizer and regression fixtures |
| CNC/CAM | Machine-specific outputs + CSV | Engine CSV foundation | Postprocessor abstraction with machine-specific deterministic exporters |
| Panel labels | PDFs/identification/tracking | Label data foundation | PDF/QR/barcode generation and scan workflow |
| Packaging | Assembly/package completeness | Workflow foundation | Package groups, missing-part checks, exploded assembly instructions |
| MES | Work orders, tracking, panel inspection | Workflow foundation | Persistent backend, operator stations, events, audit trail |
| Admin | Users/catalog/project/billing/sales channels | Basic settings UI | Multi-tenant administration and server-side authorization |
| AI copilot | Not benchmarked as a public core claim | Structured command foundation | Tool-calling agent with schema validation, undo, audit and local gateway |
| AI floorplan | Not a core public Infurnia claim | Planned | Text/image/scan to editable geometry |
| AI image→BIM | Not a core public Infurnia claim | Planned | Vision pipeline with confidence scores and human approval |
| AI cost optimization | Not a core public Infurnia claim | Planned | Material, labour and design alternative optimizer |
| AI manufacturing optimization | Not a core public Infurnia claim | Planned | Nesting, waste, machining and production-time optimizer |
| Import/export | DWG and custom 3D model imports are publicly documented | JSON only | DXF/DWG pathway, GLB/GLTF/IFC ingestion, license review |

## New engineering foundation

`src/engine/infra-engine.ts` now provides a deterministic, dependency-light core for:

- model schema and stable IDs
- finite/bounds/dimension validation
- grid snapping and overlap detection
- model-driven BOQ extraction
- quotation calculation with discount/tax
- parametric cabinet panel generation
- cutlist generation
- board nesting with kerf and rotation
- CNC-friendly CSV output
- panel label generation
- sequential manufacturing state transitions
- structured Copilot command parsing

The UI must consume these engines rather than claiming success from static labels.

## Critical defects to eliminate

1. **False model-health status:** any PASS/100% badge must be computed from validators.
2. **False renderer status:** preview must not be presented as photorealistic rendering.
3. **False AI status:** command parsing must not be represented as a general LLM agent.
4. **Client-only authorization:** project/tenant permissions must eventually be enforced by the backend.
5. **Unsafe asset imports:** remote model/archive ingestion requires URL validation, MIME checking, size limits, decompression limits and SSRF protection.
6. **Manufacturing trust:** every CNC/postprocessor output requires deterministic fixtures and golden-file regression tests.
7. **Unit confusion:** model units must be explicit and conversion tested.
8. **Geometry robustness:** NaN, infinity, negative/zero dimensions and duplicate IDs must block production exports.
9. **Revision safety:** approved designs must become immutable revisions; manufacturing outputs must point to an exact revision.
10. **AI safety:** AI modifications must be schema-validated, previewable, reversible and logged.
11. **Data durability:** local persistence must support recovery and corruption-safe snapshots.
12. **Export honesty:** JSON is not IFC/DWG/CAM interoperability; exporters need actual format validation.

## Recommended OUOBee advantage

Do not stop at feature parity. Build OUOBee Infra as a unified Design → BIM → AI → Render → Document → Price → Production → MES → Site platform with:

- local-first editing and optional cloud synchronization
- self-hosted/local AI via Ollama/llama.cpp gateway
- editable AI-generated geometry rather than flattened images
- deterministic manufacturing outputs
- client approval and revision gates
- QR/barcode-driven factory and installation tracking
- clash/clearance automation
- scenario comparison for design/cost/manufacturing alternatives
- mobile installer mode with exploded assembly instructions
- IFC/GLB/DXF interoperability where technically and legally supported
- automated geometry, export, security and manufacturing regression suites

## Verification rule

A feature is considered complete only when its primary operation works end-to-end, invalid inputs are handled, outputs are deterministic where required, and automated tests cover the critical path. A visual button or demo-only screen does not count as completion.
