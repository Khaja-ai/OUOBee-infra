/* OUOBee Infra Advanced Platform Engine
 * Deterministic domain services shared by CAD, BIM, interior, documents,
 * commercial, production and MES. UI/API layers must treat this model as source of truth.
 */
export type Unit = 'mm' | 'cm' | 'm';
export type ViewKind = 'plan' | '3d' | 'elevation' | 'section' | 'ceiling' | 'electrical';
export type ManufacturingState = 'DRAFT'|'QC'|'APPROVED'|'CUTLIST'|'NESTING'|'CNC'|'EDGE'|'ASSEMBLY'|'QC_FINAL'|'PACKAGING'|'DISPATCH'|'INSTALL'|'DONE';
export interface Point { x:number; y:number }
export interface Rect { x:number; y:number; width:number; height:number; rotation:number }
export interface ParametricConstraint { id:string; kind:'distance'|'equal'|'parallel'|'perpendicular'|'aligned'|'centered'|'fixed'; a:string; b?:string; value?:number; enabled:boolean }
export interface AecEntity { id:string; kind:string; name:string; levelId?:string; parentId?:string; geometry:Rect; height:number; materialId?:string; parameters:Record<string,number|string|boolean>; properties:Record<string,string|number|boolean>; tags:string[] }
export interface Material { id:string; sku:string; name:string; category:string; thickness:number; sheetWidth?:number; sheetHeight?:number; costPerM2:number; wasteFactor:number; grainLocked:boolean; edgeBand?:number; textureUrl?:string }
export interface Level { id:string; name:string; elevation:number; height:number }
export interface Relationship { from:string; type:'contains'|'hosts'|'opens-in'|'supports'|'assembled-from'|'connected-to'; to:string }
export interface ProjectModel { id:string; name:string; unit:Unit; levels:Level[]; entities:AecEntity[]; materials:Material[]; relationships:Relationship[]; constraints:ParametricConstraint[]; revision:number }
export interface ValidationIssue { code:string; severity:'error'|'warning'|'info'; message:string; entityIds?:string[] }
export interface ValidationReport { valid:boolean; issues:ValidationIssue[] }
export interface Quantity { code:string; description:string; category:string; quantity:number; unit:string; areaM2:number; volumeM3:number; materialId?:string }
export interface PriceLine extends Quantity { unitPrice:number; waste:number; labour:number; taxRate:number; discountRate:number; total:number }
export interface Scenario { id:string; name:string; materialFactor:number; labourFactor:number; wasteFactor:number }
export interface OptimizationResult { scenarioId:string; total:number; savings:number; notes:string[] }
export interface ProductionPart { id:string; sourceEntityId:string; code:string; width:number; height:number; thickness:number; materialId:string; grainLocked:boolean; edgeLeft:number; edgeRight:number; edgeTop:number; edgeBottom:number }
export interface Placement extends ProductionPart { boardId:string; x:number; y:number; rotated:boolean }
export interface Board { id:string; width:number; height:number; materialId:string; placements:Placement[] }
export interface NestingResult { boards:Board[]; unplaced:ProductionPart[]; utilization:number; wasteM2:number }
export interface WorkOrder { id:string; projectId:string; revision:number; state:ManufacturingState; partIds:string[]; approvedBy?:string; approvedAt?:string; events:Array<{state:ManufacturingState;at:string;actor:string;note?:string}> }

const finite=(n:number)=>Number.isFinite(n);
const area=(r:Rect)=>Math.max(0,r.width*r.height)/1e6;
const volume=(e:AecEntity)=>Math.max(0,e.geometry.width*e.geometry.height*e.height)/1e9;
export const convert=(value:number,from:Unit,to:Unit)=>{const mm=from==='mm'?value:from==='cm'?value*10:value*1000;return to==='mm'?mm:to==='cm'?mm/10:mm/1000};

export function validateProject(model:ProjectModel):ValidationReport{
 const issues:ValidationIssue[]=[]; const ids=new Set<string>(); const map=new Map(model.entities.map(e=>[e.id,e]));
 if(!model.id.trim()) issues.push({code:'MODEL_ID',severity:'error',message:'Project ID is required'});
 if(!model.name.trim()) issues.push({code:'MODEL_NAME',severity:'error',message:'Project name is required'});
 for(const e of model.entities){
  if(!e.id.trim()||ids.has(e.id)) issues.push({code:'DUPLICATE_ID',severity:'error',message:`Invalid or duplicate entity ID ${e.id}`,entityIds:[e.id]}); ids.add(e.id);
  const g=e.geometry; for(const [k,v] of Object.entries(g)) if(k!=='rotation'&&!finite(v)) issues.push({code:'NON_FINITE',severity:'error',message:`${e.id}.${k} is not finite`,entityIds:[e.id]});
  if(g.width<=0||g.height<=0||e.height<=0) issues.push({code:'INVALID_SIZE',severity:'error',message:`${e.name} has non-positive dimensions`,entityIds:[e.id]});
  if(Math.abs(g.x)>1e7||Math.abs(g.y)>1e7||e.height>1e6) issues.push({code:'UNIT_OUTLIER',severity:'warning',message:`${e.name} has unusually large geometry; verify units`,entityIds:[e.id]});
 }
 for(const r of model.relationships) if(!map.has(r.from)||!map.has(r.to)) issues.push({code:'BROKEN_RELATIONSHIP',severity:'error',message:`Broken ${r.type} relationship`,entityIds:[r.from,r.to]});
 for(const c of model.constraints) if(!map.has(c.a)||(c.b&&!map.has(c.b))) issues.push({code:'BROKEN_CONSTRAINT',severity:'error',message:`Constraint ${c.id} references missing entity`});
 const openings=model.entities.filter(e=>e.kind==='door'||e.kind==='window'); for(const o of openings) if(!model.relationships.some(r=>r.type==='opens-in'&&(r.from===o.id||r.to===o.id))) issues.push({code:'UNHOSTED_OPENING',severity:'warning',message:`${o.name} has no host wall`,entityIds:[o.id]});
 issues.push({code:'MODEL_STATS',severity:'info',message:`${model.entities.length} entities, ${model.levels.length} levels, ${model.revision} revision`});
 return {valid:!issues.some(i=>i.severity==='error'),issues};
}

export function deriveQuantities(model:ProjectModel):Quantity[]{
 const groups=new Map<string,Quantity>(); for(const e of model.entities){const code=`${e.kind}:${e.materialId??'GENERIC'}`; const q=groups.get(code)??{code,description:e.name,category:e.kind,quantity:0,unit:'nos',areaM2:0,volumeM3:0,materialId:e.materialId}; q.quantity++; q.areaM2+=area(e.geometry); q.volumeM3+=volume(e); groups.set(code,q)} return [...groups.values()];
}
export function priceProject(model:ProjectModel, scenarios:Scenario[], opts:{labourPerEntity?:number;taxRate?:number;discountRate?:number}={}):OptimizationResult[]{
 const qs=deriveQuantities(model); const baseMat=qs.reduce((s,q)=>s+q.areaM2*(model.materials.find(m=>m.id===q.materialId)?.costPerM2??0),0); const baseLab=model.entities.length*(opts.labourPerEntity??150); const tax=opts.taxRate??0.18; const discount=opts.discountRate??0;
 return scenarios.map(s=>{const material=baseMat*s.materialFactor;const labour=baseLab*s.labourFactor;const waste=material*Math.max(0,s.wasteFactor-1);const subtotal=material+labour+waste;const total=(subtotal*(1-discount))*(1+tax);return{scenarioId:s.id,total,savings:Math.max(0,(baseMat+baseLab)*(1+tax)-total),notes:[`Material ${material.toFixed(2)}`,`Labour ${labour.toFixed(2)}`,`Waste ${waste.toFixed(2)}`]}}).sort((a,b)=>a.total-b.total);
}
export function generateAutoDimensions(model:ProjectModel,view:ViewKind='plan'):{id:string;entityId:string;axis:'X'|'Y'|'Z';value:number;label:string}[]{
 return model.entities.flatMap(e=>view==='3d'?[{id:`${e.id}-Z`,entityId:e.id,axis:'Z' as const,value:e.height,label:`${Math.round(e.height)} mm`}]:[{id:`${e.id}-X`,entityId:e.id,axis:'X' as const,value:e.geometry.width,label:`${Math.round(e.geometry.width)} mm`},{id:`${e.id}-Y`,entityId:e.id,axis:'Y' as const,value:e.geometry.height,label:`${Math.round(e.geometry.height)} mm`}]);
}
export function createWorkOrder(projectId:string,revision:number,partIds:string[]):WorkOrder{return{id:`WO-${Date.now()}`,projectId,revision,state:'DRAFT',partIds,events:[{state:'DRAFT',at:new Date().toISOString(),actor:'system'}]}}
const flow:ManufacturingState[]=['DRAFT','QC','APPROVED','CUTLIST','NESTING','CNC','EDGE','ASSEMBLY','QC_FINAL','PACKAGING','DISPATCH','INSTALL','DONE'];
export function transitionWorkOrder(order:WorkOrder,next:ManufacturingState,actor:string,note?:string):WorkOrder{const a=flow.indexOf(order.state),b=flow.indexOf(next);if(b!==a+1)throw new Error(`Invalid manufacturing transition ${order.state} -> ${next}`);return{...order,state:next,events:[...order.events,{state:next,at:new Date().toISOString(),actor,note}]}}

function overlap(a:{x:number;y:number;width:number;height:number},b:{x:number;y:number;width:number;height:number}){return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y}
export function nestParts(parts:ProductionPart[],boardsInput:Array<{id:string;width:number;height:number;materialId:string}>,kerf=4):NestingResult{
 const remaining=[...parts].sort((a,b)=>b.width*b.height-a.width*a.height);const boards:Board[]=[];
 for(const raw of boardsInput){const b:Board={...raw,placements:[]}; for(let i=remaining.length-1;i>=0;i--){const p=remaining[i];if(p.materialId!==b.materialId)continue;const variants=[{w:p.width,h:p.height,r:false},{w:p.height,h:p.width,r:true}].filter(v=>!p.grainLocked||!v.r||p.width===p.height);let placed:Placement|undefined; for(const v of variants){for(let y=0;y+v.h<=b.height;y+=25)for(let x=0;x+v.w<=b.width;x+=25){const candidate={x,y,width:v.w+kerf,height:v.h+kerf};if(!b.placements.some(q=>overlap({x:q.x,y:q.y,width:q.width+kerf,height:q.height+kerf},candidate))){placed={...p,x,y,rotated:v.r,boardId:b.id};break}}if(placed)break} if(placed){b.placements.push(placed);remaining.splice(i,1)}} boards.push(b);if(!remaining.length)break}
 const boardArea=boards.reduce((s,b)=>s+b.width*b.height,0)/1e6;const used=boards.reduce((s,b)=>s+b.placements.reduce((a,p)=>a+p.width*p.height,0),0)/1e6;return{boards,unplaced:remaining,utilization:boardArea?used/boardArea:0,wasteM2:Math.max(0,boardArea-used)};
}
export function generateCncCsv(result:NestingResult):string{const rows=['board_id,part_id,x_mm,y_mm,width_mm,height_mm,rotation,material_id'];for(const b of result.boards)for(const p of b.placements)rows.push([b.id,p.id,p.x,p.y,p.width,p.height,p.rotated?'90':'0',p.materialId].join(','));return rows.join('\n')+'\n'}
export function generatePanelLabelData(parts:ProductionPart[]){return parts.map((p,i)=>({sequence:i+1,code:p.code,sourceEntityId:p.sourceEntityId,size:`${p.width} × ${p.height} × ${p.thickness} mm`,materialId:p.materialId,grain:p.grainLocked?'LOCKED':'ROTATABLE'}))}
export interface AiPlan {intent:'design'|'validate'|'commercial'|'production'|'documentation';tools:string[];requiresApproval:boolean;confidence:number}
export function planAiRequest(text:string):AiPlan{const q=text.toLowerCase();if(/cnc|nest|cutlist|manufactur|factory/.test(q))return{intent:'production',tools:['validateProject','deriveQuantities','nestParts','generateCncCsv'],requiresApproval:true,confidence:.94};if(/cost|price|budget|quote|boq|bom/.test(q))return{intent:'commercial',tools:['validateProject','deriveQuantities','priceProject'],requiresApproval:true,confidence:.93};if(/drawing|dimension|elevation|section/.test(q))return{intent:'documentation',tools:['validateProject','generateAutoDimensions'],requiresApproval:false,confidence:.9};if(/check|clash|valid/.test(q))return{intent:'validate',tools:['validateProject'],requiresApproval:false,confidence:.95};return{intent:'design',tools:['validateProject'],requiresApproval:true,confidence:.7}}
