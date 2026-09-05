# OUOBee Infra — Infurnia Parity & Engineering Audit

Date: 2026-09-05

## Source reviewed

Public Infurnia website and public Help Center material were reviewed for architecture, interior design, BIM, rendering, documentation, pricing, production design, admin and MES workflows.

## Current OUOBee Infra implementation

The current repository contains a functional React/Vite foundation with a browser-side model consisting of rooms, walls, doors, windows and furniture; selection/editing; live basic quantities; JSON export; BOQ view; BIM-class mapping UI; catalog starter; render preview; manufacturing workflow UI; collaboration/roles UI; and a local command-style copilot. It is explicitly not yet a production BIM/CAD/MES engine.

## Parity matrix

| Capability | Infurnia public capability | OUOBee Infra status | Engineering action |
|---|---|---|---|
| 2D floor plans | Detailed 2D drafting | Foundation | Build constraint CAD engine |
| CAD tools | line/trim/offset/annotation and related drafting | Partial | Add snapping, constraints, layers, dimensions, trim/offset |
| 3D sketch | push/pull, shape/curve tools | Missing | Add Three.js geometry workspace |
| Parametric BIM | synchronized model/views/quantities | Foundation only | Add persistent parametric graph |
| Multi-view | plan/3D/elevation | Partial | Add synchronized viewports |
| Architecture | building components | Partial | Add slabs, columns, beams, stairs, roofs, openings |
| Interior | walls, tiles, ceilings, furniture | Partial | Add material, tiling, ceiling and lighting systems |
| Catalog | large/custom 3D catalog | Starter | Add asset service, GLB/GLTF/IFC ingestion, metadata/SKU |
| Custom panels | horizontal/vertical/L-shaped/fluted | Missing | Add parametric panel families |
| Modular design | cabinets/wardrobes/kitchens | Starter | Add cabinet rules and parametric assemblies |
| Rendering | 2D/3D/cloud/parallel/360 | Preview only | Add real renderer + worker queue + panorama |
| Documentation | plans/elevations/dimensions/presentations | Partial | Add drawing generation and templates |
| BOQ/BOM | live one-click quantities | Basic | Add material/labour/hardware pricing and BOM graph |
| Pricing | quotation rules, discounts, taxes, exports | Missing | Add pricing engine and PDF/CSV/XLSX outputs |
| Collaboration | real-time collaboration/admin | UI only | Add auth, WebSocket sync, revisions and permissions |
| Production QC | production design verification | UI only | Add deterministic manufacturability gates |
| MES | work orders and production tracking | UI only | Add persistent work-order/state machine backend |
| Cutlists | optimized panel cutlists | Missing | Add deterministic cutlist generation |
| Board optimization | nesting/utilization | Missing | Add nesting optimizer with grain/edge constraints |
| CNC/CAM | machine-specific outputs | Missing | Add postprocessor architecture; never claim machine compatibility without tests |
| Panel labels | PDF labels/tracking | Missing | Add QR/barcode label generator |
| Packaging | exploded assembly/packaging | Missing | Add assembly graph and packing rules |
| AI | Infurnia is not primarily AI-first | OUOBee advantage | Build tool-calling design copilot, image-to-model and optimization agents |
| Local/self-hosted AI | Not the core public differentiator | Planned | Ollama/llama.cpp gateway with optional cloud providers |

## Critical honesty rule

The UI must never show PASS/VALID/100% for checks that are not actually implemented. Any validation badge in a future production build must be backed by deterministic validators and show the validator version and timestamp.

## Bugs / risks identified in the current foundation

1. The GitHub Actions workflow initially failed before installing dependencies because `setup-node` requested npm caching while the repository had no lockfile. This was fixed by removing the cache requirement until a lockfile is committed.
2. The current UI contains starter-state claims such as model health/validation that should not be interpreted as production validation. These must be replaced by real validators as the BIM engine is implemented.
3. The current 'saved locally' language is a product-direction claim, not a durable persistence guarantee. Persistent IndexedDB/OPFS project storage and recovery are required before treating it as autosave.
4. The current render action is a preview foundation, not a photorealistic renderer. A production release must not claim that a render completed until a render job actually finishes.
5. The current copilot is a structured command demo, not a general LLM agent. Future tool calls must validate permissions and model mutations before commit.
6. The current JSON export is a project interchange format, not IFC/DWG/CAM interoperability.
7. Geometry input needs bounds, finite-number validation, negative-size rejection and constraint validation before it is trusted for quantities or manufacturing.
8. Remote asset imports must be protected against SSRF, malicious archives, oversized assets and unsafe MIME/content mismatches.
9. Multi-tenant backend storage must enforce tenant/project ownership at every query and object-storage key.
10. Manufacturing exports require deterministic regression fixtures per machine/postprocessor; never rely on visual inspection alone.

## OUOBee Infra advanced additions

Beyond Infurnia parity, the target architecture adds:

- AI text -> editable floorplan/BIM
- image/PDF/scan -> editable starting geometry
- AI interior redesign that edits actual scene objects
- design copilot with reversible commands and approval mode
- automated clash and clearance detection
- AI cost optimizer
- AI material/waste optimizer
- manufacturing nesting optimizer
- design A/B scenario comparison by cost, material waste and manufacturability
- client approval portal
- installer/mobile mode with QR-linked panel instructions
- WebXR/AR-ready scene export
- local-first editing and cloud synchronization
- immutable revisions and approval gates
- open-standard IFC/GLB/DXF pathways where licensing and format requirements permit

## Definition of production-ready

A feature is considered complete only after:

- unit tests
- integration tests
- UI/E2E test coverage where applicable
- invalid-input tests
- permission tests
- export/import round-trip tests
- deterministic fixture tests for quantities
- crash/recovery testing
- performance testing for representative models
- security review
- CI build passes

No placeholder button, simulated success, or static status badge should be counted as completed functionality.
