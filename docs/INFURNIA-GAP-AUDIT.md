# Infurnia -> OUOBee Infra gap audit

## Benchmark coverage

The public Infurnia product/help material describes architecture and interior 2D/3D design, BIM, synchronized views, catalog/custom components, rendering, working drawings, BOQ/quotations, collaboration and manufacturing/MES workflows including work orders, cutlists, CNC outputs, labels and production tracking.

## OUOBee Infra status

| Area | Status |
|---|---|
| 2D model workspace | Foundation implemented |
| Parametric object properties | Foundation implemented |
| Live quantities / BOQ | Implemented foundation |
| Architecture components | Starter objects implemented; geometry engine required |
| Interior catalog | Starter workflow implemented |
| BIM/IFC | UI + class mapping foundation; real IFC engine next |
| Rendering | Preview stage; real renderer/worker next |
| Documents | BOQ + print foundation; drawing generator next |
| Manufacturing | Workflow + gates foundation; algorithms/CAM next |
| Collaboration | Role UI foundation; realtime backend next |
| AI copilot | Local structured command foundation; model gateway next |

## High-priority engineering backlog

1. Replace SVG starter geometry with a constraint-aware CAD/geometry engine.
2. Add Three.js + web-ifc/ThatOpen with license and attribution review.
3. Add PostgreSQL persistence, tenant isolation, auth/RBAC, object storage and background jobs.
4. Add IFC import/export, property sets, quantities, validation and clash detection.
5. Add deterministic cutlist, nesting, edge-banding, hardware and CNC postprocessor pipeline.
6. Add drawing generation, revision/approval gates and PDF export tests.
7. Add local AI gateway with structured tool calling and safe operation validation.
8. Add security gates: SSRF protection, archive limits, MIME validation, path traversal prevention, rate limiting and signed asset URLs.
9. Add unit, integration, geometry, export and end-to-end browser tests before production claims.

## Source-use rule

Infurnia is used as a public functional benchmark. OUOBee Infra must use independently implemented code and properly licensed open-source components; it must not copy proprietary Infurnia source code, branding or private assets.
