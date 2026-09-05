export type ElementKind = 'wall' | 'room' | 'door' | 'window' | 'furniture' | 'cabinet' | 'panel';
export type ManufacturingStage = 'DESIGN' | 'QC' | 'CUTLIST' | 'NESTING' | 'CNC' | 'ASSEMBLY' | 'PACKAGING' | 'INSTALL' | 'DONE';

export interface Geometry2D {
  x: number; y: number; width: number; height: number; rotation?: number;
}

export interface InfraElement extends Geometry2D {
  id: string;
  kind: ElementKind;
  name: string;
  level?: number;
  material?: string;
  properties?: Record<string, string | number | boolean>;
}

export interface InfraModel {
  id: string;
  name: string;
  units: 'mm' | 'cm' | 'm';
  elements: InfraElement[];
  metadata?: Record<string, string>;
}

export interface ValidationIssue {
  code: string;
  severity: 'error' | 'warning';
  elementId?: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface PanelPart {
  id: string;
  cabinetId: string;
  name: string;
  width: number;
  height: number;
  thickness: number;
  material: string;
  quantity: number;
  edgeBanding: { top: number; right: number; bottom: number; left: number };
}

export interface BoardSheet { id: string; width: number; height: number; thickness: number; material: string; }
export interface NestedPart extends PanelPart { x: number; y: number; rotated: boolean; }
export interface NestingResult { boards: Array<{ board: BoardSheet; parts: NestedPart[]; utilization: number }>; unplaced: PanelPart[]; }

export interface PriceLine { code: string; description: string; quantity: number; unit: string; unitPrice: number; total: number; }
export interface Quotation { lines: PriceLine[]; subtotal: number; discount: number; tax: number; grandTotal: number; currency: string; }

export interface WorkOrder { id: string; modelId: string; stage: ManufacturingStage; createdAt: string; parts: PanelPart[]; history: Array<{ stage: ManufacturingStage; at: string }> }

const finite = (n: number) => Number.isFinite(n);
const positive = (n: number) => finite(n) && n > 0;

export function validateModel(model: InfraModel): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  if (!model.id.trim()) errors.push({ code: 'MODEL_ID_REQUIRED', severity: 'error', message: 'Model ID is required.' });
  if (!model.name.trim()) errors.push({ code: 'MODEL_NAME_REQUIRED', severity: 'error', message: 'Model name is required.' });
  const ids = new Set<string>();
  for (const e of model.elements) {
    if (!e.id.trim()) errors.push({ code: 'ELEMENT_ID_REQUIRED', severity: 'error', message: 'Every element requires a stable ID.' });
    if (ids.has(e.id)) errors.push({ code: 'DUPLICATE_ELEMENT_ID', severity: 'error', elementId: e.id, message: `Duplicate element ID: ${e.id}.` });
    ids.add(e.id);
    for (const [key, value] of Object.entries({ x: e.x, y: e.y, width: e.width, height: e.height })) {
      if (!finite(value)) errors.push({ code: 'NON_FINITE_GEOMETRY', severity: 'error', elementId: e.id, message: `${key} must be finite.` });
    }
    if (!positive(e.width) || !positive(e.height)) errors.push({ code: 'INVALID_DIMENSION', severity: 'error', elementId: e.id, message: 'Width and height must be greater than zero.' });
    if (Math.abs(e.x) > 1_000_000 || Math.abs(e.y) > 1_000_000 || e.width > 1_000_000 || e.height > 1_000_000) warnings.push({ code: 'EXTREME_GEOMETRY', severity: 'warning', elementId: e.id, message: 'Geometry is unusually large; check units.' });
    if (!e.name.trim()) warnings.push({ code: 'ELEMENT_NAME_EMPTY', severity: 'warning', elementId: e.id, message: 'Element has no descriptive name.' });
  }
  const area = model.elements.filter(e => e.kind === 'room').reduce((sum, e) => sum + e.width * e.height, 0);
  if (area <= 0) warnings.push({ code: 'NO_ROOM_AREA', severity: 'warning', message: 'No positive room area is present.' });
  return { valid: errors.length === 0, errors, warnings };
}

export function snap(value: number, grid = 50): number { return Math.round(value / grid) * grid; }
export function snapGeometry(g: Geometry2D, grid = 50): Geometry2D { return { ...g, x: snap(g.x, grid), y: snap(g.y, grid), width: snap(g.width, grid), height: snap(g.height, grid) }; }
export function overlaps(a: Geometry2D, b: Geometry2D): boolean { return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; }
export function area(g: Geometry2D): number { return Math.max(0, g.width) * Math.max(0, g.height); }

export function extractBOQ(model: InfraModel): PriceLine[] {
  const groups = new Map<ElementKind, number>();
  for (const e of model.elements) groups.set(e.kind, (groups.get(e.kind) ?? 0) + 1);
  return [...groups.entries()].map(([kind, quantity]) => ({ code: `MODEL-${kind.toUpperCase()}`, description: kind, quantity, unit: 'nos', unitPrice: 0, total: 0 }));
}

export function calculateQuotation(lines: PriceLine[], options: { discount?: number; taxRate?: number; currency?: string } = {}): Quotation {
  const normalized = lines.map(line => ({ ...line, total: Math.max(0, line.quantity) * Math.max(0, line.unitPrice) }));
  const subtotal = normalized.reduce((s, l) => s + l.total, 0);
  const discount = Math.min(subtotal, Math.max(0, options.discount ?? 0));
  const taxable = subtotal - discount;
  const tax = taxable * Math.max(0, options.taxRate ?? 0);
  return { lines: normalized, subtotal, discount, tax, grandTotal: taxable + tax, currency: options.currency ?? 'INR' };
}

export function generateCabinetParts(cabinet: InfraElement, options: { carcassThickness?: number; backThickness?: number; material?: string } = {}): PanelPart[] {
  const t = options.carcassThickness ?? 18;
  const back = options.backThickness ?? 6;
  const material = options.material ?? cabinet.material ?? 'MR Grade Board';
  const w = cabinet.width, h = cabinet.height, d = Math.max(300, cabinet.properties?.depth as number ?? 560);
  const make = (id: string, name: string, width: number, height: number, thickness = t): PanelPart => ({ id, cabinetId: cabinet.id, name, width, height, thickness, material, quantity: 1, edgeBanding: { top: 1, right: 1, bottom: 1, left: 1 } });
  return [
    make(`${cabinet.id}-L`, 'Left side', d, h),
    make(`${cabinet.id}-R`, 'Right side', d, h),
    make(`${cabinet.id}-T`, 'Top', w - 2 * t, d),
    make(`${cabinet.id}-B`, 'Bottom', w - 2 * t, d),
    make(`${cabinet.id}-BK`, 'Back', w - 2 * t, h - 2 * t, back),
    make(`${cabinet.id}-SH`, 'Shelf', w - 2 * t, d, t)
  ];
}

export function buildCutlist(model: InfraModel): PanelPart[] {
  return model.elements.filter(e => e.kind === 'cabinet').flatMap(e => generateCabinetParts(e));
}

export function nestPanels(parts: PanelPart[], boards: BoardSheet[], kerf = 3): NestingResult {
  const remaining = parts.flatMap(p => Array.from({ length: Math.max(1, p.quantity) }, (_, i) => ({ ...p, id: `${p.id}-${i + 1}` })));
  const result: NestingResult['boards'] = [];
  const unplaced: PanelPart[] = [];
  for (const board of boards) {
    const placed: NestedPart[] = [];
    let x = 0, y = 0, rowH = 0;
    for (let i = remaining.length - 1; i >= 0; i--) {
      const p = remaining[i];
      let pw = p.width, ph = p.height, rotated = false;
      if (x + pw > board.width) { x = 0; y += rowH + kerf; rowH = 0; }
      if (y + ph > board.height && x === 0 && pw !== ph && x + ph <= board.width && y + pw <= board.height) { pw = p.height; ph = p.width; rotated = true; }
      if (x + pw <= board.width && y + ph <= board.height) {
        placed.push({ ...p, x, y, width: pw, height: ph, rotated }); remaining.splice(i, 1); x += pw + kerf; rowH = Math.max(rowH, ph);
      }
    }
    const used = placed.reduce((s, p) => s + p.width * p.height, 0);
    result.push({ board, parts: placed, utilization: board.width * board.height ? used / (board.width * board.height) : 0 });
    if (!remaining.length) break;
  }
  unplaced.push(...remaining);
  return { boards: result, unplaced };
}

export function generateCncCsv(parts: NestedPart[]): string {
  const header = 'PART_ID,CABINET_ID,NAME,WIDTH_MM,HEIGHT_MM,THICKNESS_MM,MATERIAL,X_MM,Y_MM,ROTATED';
  const rows = parts.map(p => [p.id, p.cabinetId, csv(p.name), p.width, p.height, p.thickness, csv(p.material), p.x, p.y, p.rotated ? '1' : '0'].join(','));
  return [header, ...rows].join('\n');
}
function csv(value: string): string { return `"${value.replaceAll('"', '""')}"`; }

export function generatePanelLabels(parts: PanelPart[]): string[] { return parts.map((p, i) => `OUOBEE-${String(i + 1).padStart(4, '0')} | ${p.cabinetId} | ${p.name} | ${p.width}x${p.height}x${p.thickness}mm | ${p.material}`); }

const stages: ManufacturingStage[] = ['DESIGN', 'QC', 'CUTLIST', 'NESTING', 'CNC', 'ASSEMBLY', 'PACKAGING', 'INSTALL', 'DONE'];
export function transitionWorkOrder(order: WorkOrder, next: ManufacturingStage): WorkOrder {
  const current = stages.indexOf(order.stage), target = stages.indexOf(next);
  if (target !== current + 1) throw new Error(`Invalid manufacturing transition ${order.stage} → ${next}`);
  const at = new Date().toISOString();
  return { ...order, stage: next, history: [...order.history, { stage: next, at }] };
}

export type CopilotCommand = { action: 'MOVE' | 'ADD' | 'DELETE' | 'GENERATE_BOQ' | 'VALIDATE' | 'UNKNOWN'; target?: string; x?: number; y?: number };
export function parseCopilotCommand(input: string): CopilotCommand {
  const q = input.trim().toLowerCase();
  if (/\b(boq|bill of quantities)\b/.test(q)) return { action: 'GENERATE_BOQ' };
  if (/\b(check|validate|validation|conflict|clash)\b/.test(q)) return { action: 'VALIDATE' };
  const move = q.match(/move\s+(?:the\s+)?([a-z0-9 _-]+?)(?:\s+by\s+(-?\d+)\s*(?:mm)?(?:\s*,\s*|\s+and\s+)(-?\d+)\s*(?:mm)?)?$/);
  if (move) return { action: 'MOVE', target: move[1].trim(), x: Number(move[2] ?? 0), y: Number(move[3] ?? 0) };
  if (/\b(add|create)\b.*\b(kitchen|cabinet|wardrobe|sofa|window|door|wall|room)\b/.test(q)) return { action: 'ADD', target: q.match(/\b(kitchen|cabinet|wardrobe|sofa|window|door|wall|room)\b/)?.[1] };
  if (/\b(delete|remove)\b/.test(q)) return { action: 'DELETE', target: q.replace(/.*\b(delete|remove)\b\s*/, '').trim() };
  return { action: 'UNKNOWN' };
}
