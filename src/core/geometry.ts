import {ModelElement,Vec2,snapPoint} from './model';
export function distance(a:Vec2,b:Vec2){return Math.hypot(a.x-b.x,a.y-b.y)}
export function rectContains(p:Vec2,e:ModelElement){return p.x>=e.x&&p.x<=e.x+e.width&&p.y>=e.y&&p.y<=e.y+e.height}
export function aabb(e:ModelElement){return {minX:e.x,minY:e.y,maxX:e.x+e.width,maxY:e.y+e.height}}
export function intersects(a:ModelElement,b:ModelElement){const A=aabb(a),B=aabb(b);return A.minX<B.maxX&&A.maxX>B.minX&&A.minY<B.maxY&&A.maxY>B.minY}
export function moveElement(e:ModelElement,x:number,y:number,snap:boolean,grid:number){const p=snap?snapPoint({x,y},grid):{x,y};return {...e,x:p.x,y:p.y}}
export function resizeElement(e:ModelElement,width:number,height:number){return {...e,width:Math.max(1,width),height:Math.max(1,height)}}
export function rotateElement(e:ModelElement,deg:number){return {...e,rotation:((deg%360)+360)%360}}
export function offsetRect(e:ModelElement,d:number){return {...e,x:e.x-d,y:e.y-d,width:e.width+2*d,height:e.height+2*d}}
export function trimToBounds(e:ModelElement,b:{width:number;height:number}){return {...e,x:Math.max(0,Math.min(e.x,b.width-e.width)),y:Math.max(0,Math.min(e.y,b.height-e.height))}}
export function collisionWarnings(elements:ModelElement[]){const out:{a:string;b:string}[]=[];for(let i=0;i<elements.length;i++)for(let j=i+1;j<elements.length;j++)if(intersects(elements[i],elements[j])&&elements[i].kind!=='room'&&elements[j].kind!=='room')out.push({a:elements[i].id,b:elements[j].id});return out}
