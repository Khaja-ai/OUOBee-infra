import {ProjectModel,cloneProject} from './model';
const KEY='ouobee-infra-project-v2';
export function saveProject(model:ProjectModel){const next={...cloneProject(model),revision:model.revision+1,updatedAt:new Date().toISOString()};localStorage.setItem(KEY,JSON.stringify(next));return next}
export function loadProject():ProjectModel|null{try{const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw) as ProjectModel:null}catch{return null}}
export function clearProject(){localStorage.removeItem(KEY)}
export function exportProject(model:ProjectModel){const blob=new Blob([JSON.stringify(model,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${model.name.replace(/[^a-z0-9]+/gi,'-').toLowerCase()||'project'}.ouobee.json`;a.click();URL.revokeObjectURL(url)}
export async function importProject(file:File){if(file.size>25*1024*1024)throw new Error('Project file exceeds 25 MB');const text=await file.text();const parsed=JSON.parse(text) as ProjectModel;if(!parsed||!Array.isArray(parsed.elements))throw new Error('Invalid OUOBee project');return parsed}
