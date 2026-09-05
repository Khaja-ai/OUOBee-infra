export type ElementKind = 'wall'|'room'|'door'|'window'|'furniture'|'slab'|'column'|'beam'|'stair'|'roof'|'cabinet'|'panel'|'fixture';
export type IfcClass = 'IfcWall'|'IfcSpace'|'IfcDoor'|'IfcWindow'|'IfcFurnishingElement'|'IfcSlab'|'IfcColumn'|'IfcBeam'|'IfcStair'|'IfcRoof'|'IfcFurniture';
export interface Vec2 { x:number; y:number }
export interface ModelElement { id:string; kind:ElementKind; name:string; x:number; y:number; width:number; height:number; elevation:number; depth:number; rotation:number; materialId?:string; parentId?:string; ifcClass?:IfcClass; metadata?:Record<string,string|number|boolean> }
export interface ProjectModel { schemaVersion:2; id:string; name:string; units:'mm'; elements:ModelElement[]; settings:{grid:number; snap:boolean; tolerance:number}; revision:number; updatedAt:string }
export interface ValidationIssue { severity:'error'|'warning'; code:string; elementId?:string; message:string }

export function createProject(name='Untitled Project'):ProjectModel { return {schemaVersion:2,id:crypto.randomUUID(),name,elements:[],settings:{grid:50,snap:true,tolerance:1},revision:0,updatedAt:new Date().toISOString()} }
export function finite(n:number){return Number.isFinite(n)}
export function validateModel(model:ProjectModel):ValidationIssue[]{
 const issues:ValidationIssue[]=[]; const ids=new Set<string>();
 if(model.schemaVersion!==2) issues.push({severity:'error',code:'SCHEMA_VERSION',message:'Unsupported project schema version'});
 for(const e of model.elements){
  if(ids.has(e.id)) issues.push({severity:'error',code:'DUPLICATE_ID',elementId:e.id,message:'Duplicate element id'}); ids.add(e.id);
  for(const [k,v] of Object.entries(e)) if(['x','y','width','height','elevation','depth','rotation'].includes(k) && typeof v==='number' && !finite(v)) issues.push({severity:'error',code:'NON_FINITE',elementId:e.id,message:`${k} must be finite`});
  if(e.width<=0||e.height<=0||e.depth<=0) issues.push({severity:'error',code:'NON_POSITIVE_SIZE',elementId:e.id,message:'Dimensions must be greater than zero'});
  if(e.width>100000||e.height>100000||Math.abs(e.x)>1000000||Math.abs(e.y)>1000000) issues.push({severity:'error',code:'OUT_OF_BOUNDS',elementId:e.id,message:'Geometry exceeds safe project bounds'});
  if(e.rotation<-360||e.rotation>360) issues.push({severity:'warning',code:'ROTATION_RANGE',elementId:e.id,message:'Rotation is outside the preferred range'});
 }
 return issues;
}
export function areaMm2(e:ModelElement){return e.width*e.height}
export function snap(value:number,grid:number){return grid>0?Math.round(value/grid)*grid:value}
export function snapPoint(p:Vec2,grid:number){return {x:snap(p.x,grid),y:snap(p.y,grid)}}
export function cloneProject(m:ProjectModel):ProjectModel{return structuredClone(m)}
