# OUOBee Infra

AI-first architecture, interior design, BIM, documentation and manufacturing workspace.

## Current build

This repository now contains a working React/Vite foundation with a functional in-browser design model:

- Project workspace and responsive SaaS shell
- 2D SVG design canvas
- Parametric wall, room, door, window and furniture objects
- Object selection, deletion and dimension/name editing
- Live quantity extraction for walls, openings, furniture and area
- JSON project export
- BOQ view driven by the same live model
- BIM class mapping and validation-gate UI
- Interior catalog starter workflow
- Render preview workspace
- Manufacturing release pipeline UI
- Collaboration/role workspace
- Local design copilot command layer
- Dark/light theme
- Local-first positioning with no mandatory paid AI API

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

## Product direction

OUOBee Infra is intended to become a complete design-to-manufacturing platform: 2D CAD -> parametric 3D -> BIM/IFC -> interior/catalog -> rendering -> drawings -> BOQ/BOM -> quotation -> production QC -> cutlist/nesting -> CNC/CAM -> assembly -> installation -> client portal.

The next engineering layers should add a real geometry kernel, IFC import/export, persistent project storage, backend workers, deterministic manufacturing algorithms, authentication/multitenancy and local/open-weight AI gateways.

## Important implementation rule

No button should report success for an operation that has not actually executed. Features are implemented incrementally and should be backed by automated tests before being marked production-ready.
