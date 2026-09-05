# OUOBee Infra — Advanced Build Contract

This repository is being evolved from a UI foundation into a production AEC/BIM/interior/manufacturing/MES platform.

## Definition of done
A capability is only complete when its primary workflow is implemented end-to-end, consumes the authoritative parametric model, handles invalid input, persists/reloads safely where applicable, has deterministic outputs where required, and is covered by automated tests.

## Architecture contract
- One authoritative parametric model drives 2D, 3D, BIM, documents, BOQ/BOM, pricing and manufacturing.
- Server-side authorization is mandatory for multi-tenant/cloud workflows.
- AI may propose operations, but geometry-changing, commercial and manufacturing actions require validation and explicit approval gates.
- Manufacturing exports are generated only from validated production geometry and machine-specific post-processors.
- Never display PASS/ready status unless a real validation or capability check produced it.

## Build tracks
1. Parametric CAD: constraints, snapping, editing, walls/openings, levels, sections.
2. Three.js 3D: shared geometry, transforms, materials, lighting, clipping, measurements.
3. BIM/IFC: object graph, properties, relationships, import/export and round-trip tests.
4. Interior: kitchen, wardrobe, furniture, materials, tile patterns, ceilings and lighting.
5. Documentation: plans, elevations, sections, schedules and auto-dimensions.
6. Visualization: realtime rendering, high-resolution rendering, panorama and WebXR.
7. Commercial: authoritative BOQ/BOM, pricing rules, taxes, discounts and PDF/CSV/XLSX.
8. Collaboration: backend persistence, realtime presence, locks, comments, revisions and approvals.
9. Production: QC, cutlist, nesting, CNC/CAM post-processors, labels, packaging and traceability.
10. MES: work orders, operator/machine events, station tracking, QC, dispatch and installation.
11. AI: tool-calling director with validation, floorplan generation, image/PDF-to-BIM, cost and manufacturing optimization.
12. Security/quality: tenant isolation, safe asset ingestion, rate limits, audit logs, regression tests, crash recovery and deterministic fixtures.

## Current implementation added
- `src/engine/infra-engine.ts`: initial deterministic model/BOQ/cutlist/nesting/CNC/label/state-machine engine.
- `src/engine/aec-engine.ts`: AEC validation, openings, tile/ceiling/lighting, dimensions, BOM, cost scenarios, nesting and AI routing.
- `src/engine/advanced-platform.ts`: unified authoritative project model, validation, quantities, pricing scenarios, dimensions, production work orders, nesting/CNC and AI planning.
- `src/engine/parametric-assemblies.ts`: parametric cabinet, kitchen and wardrobe panel generation.
- Three.js runtime/type dependencies are declared for the 3D implementation track.

## Important status
These engines are foundations for the complete platform. They do not by themselves constitute production completion. UI integration, backend persistence, IFC/3D runtime, rendering, exports, MES services and automated test suites remain part of the implementation contract.
