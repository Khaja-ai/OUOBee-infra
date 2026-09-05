# OUOBee Infra

AI-first architecture, interior design, BIM, documentation and manufacturing workspace.

## Infurnia benchmark

OUOBee Infra is being engineered against the publicly documented Infurnia workflow: 2D/3D design, BIM, interiors, catalog, rendering, working drawings, BOQ/pricing, production QC and MES/manufacturing. It is an independent implementation and does not copy Infurnia source code, branding or proprietary assets.

## Current build

This repository currently contains a functional React/Vite foundation:

- Responsive SaaS shell
- 2D SVG model workspace
- Parametric starter objects: wall, room, door, window and furniture
- Object selection, deletion and dimension/name editing
- Live basic quantity extraction
- JSON project export
- BOQ view driven by the same starter model
- BIM class mapping/validation UI foundation
- Interior catalog starter workflow
- Render preview workspace
- Manufacturing release pipeline UI
- Collaboration/role workspace
- Local structured copilot command layer
- Dark/light theme
- Self-hostable/local-first product direction

## Important status

This is **not yet a production replacement for Infurnia**. The repository intentionally distinguishes implemented foundation functionality from planned production engines. See `docs/INFURNIA-PARITY-AUDIT-2026-09.md` for the full gap matrix and security/quality audit.

## Planned production engines

1. Constraint-based 2D CAD
2. Three.js parametric 3D engine
3. IFC import/export and property sets
4. Synchronized plan/3D/elevation/section views
5. Architecture components and building systems
6. Interior materials, ceilings, lighting and custom panels
7. Parametric kitchen/wardrobe/cabinet assemblies
8. Catalog/asset service and custom model ingestion
9. Real-time rendering, panorama and walkthrough workers
10. Automated drawings, schedules and presentations
11. BOQ/BOM and rule-based quotation/pricing engine
12. Authentication, RBAC, multitenancy and audit logs
13. Real-time collaboration and revisions
14. Production design/QC gate
15. Cutlist and nesting optimizer
16. CNC/CAM postprocessor architecture
17. QR/barcode panel labels and packaging
18. MES work orders and shop-floor tracking
19. AI text/image -> editable design workflows
20. Local AI gateway with optional cloud providers
21. Automated geometry, export, security and manufacturing regression tests

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Engineering rules

- No fake success states.
- No hard-coded production validation results.
- Quantities must be generated from the authoritative model.
- Manufacturing output must be deterministic and fixture-tested.
- Tenant and project authorization must be enforced server-side.
- Remote imports must be protected against SSRF, archive bombs and malicious files.
- AI commands must be permission-aware, validated and reversible.
- Every production feature needs automated tests before it is marked complete.
