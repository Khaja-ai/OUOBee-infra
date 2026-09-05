import {useEffect,useRef} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

type El={id:number;type:'select'|'wall'|'room'|'door'|'window'|'furniture';x:number;y:number;w:number;h:number;name:string};

const materialFor=(type:El['type'])=>{
  const colors:{[K in El['type']]:number}={select:0x9ca3af,wall:0x64748b,room:0x1e293b,door:0x8b5cf6,window:0x38bdf8,furniture:0x10b981};
  return new THREE.MeshStandardMaterial({color:colors[type],roughness:type==='window'?0.15:0.72,metalness:type==='window'?0.25:0.05,transparent:type==='window',opacity:type==='window'?0.58:1});
};

export function ThreeDViewport({els}:{els:El[]}){
  const host=useRef<HTMLDivElement|null>(null);
  const sceneRef=useRef<THREE.Scene|null>(null);
  const groupRef=useRef<THREE.Group|null>(null);
  const cameraRef=useRef<THREE.PerspectiveCamera|null>(null);
  const rendererRef=useRef<THREE.WebGLRenderer|null>(null);

  useEffect(()=>{
    if(!host.current)return;
    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0x07100d);
    const camera=new THREE.PerspectiveCamera(45,1,0.1,5000);
    camera.position.set(520,430,620);
    const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    host.current.appendChild(renderer.domElement);
    const controls=new OrbitControls(camera,renderer.domElement);
    controls.enableDamping=true;
    controls.target.set(260,0,210);
    const hemi=new THREE.HemisphereLight(0xdfffe9,0x0b1712,2.2);
    scene.add(hemi);
    const key=new THREE.DirectionalLight(0xffffff,3.2);
    key.position.set(300,700,250); key.castShadow=true; key.shadow.mapSize.set(2048,2048); scene.add(key);
    const fill=new THREE.DirectionalLight(0x8de4ff,1.1); fill.position.set(-400,280,-250); scene.add(fill);
    const grid=new THREE.GridHelper(1000,50,0x29433a,0x16271f); grid.position.set(260,-1,210); scene.add(grid);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(1000,1000),new THREE.MeshStandardMaterial({color:0x101a16,roughness:0.9}));
    floor.rotation.x=-Math.PI/2; floor.position.set(260,-2,210); floor.receiveShadow=true; scene.add(floor);
    const group=new THREE.Group(); scene.add(group);
    sceneRef.current=scene; groupRef.current=group; cameraRef.current=camera; rendererRef.current=renderer;

    const resize=()=>{if(!host.current)return;const w=host.current.clientWidth||640;const h=host.current.clientHeight||360;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};
    resize(); window.addEventListener('resize',resize);
    let frame=0;
    const animate=()=>{frame=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)}; animate();
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);controls.dispose();renderer.dispose();scene.clear();if(host.current?.contains(renderer.domElement))host.current.removeChild(renderer.domElement)};
  },[]);

  useEffect(()=>{
    const group=groupRef.current;if(!group)return;
    while(group.children.length){const child=group.children.pop();if(child){child.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)m.geometry.dispose();if(Array.isArray(m.material))m.material.forEach(x=>x.dispose());else if(m.material)m.material.dispose()})}}
    const scale=0.8;
    els.forEach(e=>{
      const isRoom=e.type==='room';
      const height=isRoom?6:e.type==='wall'?270:e.type==='door'||e.type==='window'?215:120;
      const width=Math.max(4,e.w*scale); const depth=Math.max(4,e.h*scale);
      const geo=new THREE.BoxGeometry(width,height,depth);
      const mesh=new THREE.Mesh(geo,materialFor(e.type));
      mesh.position.set(e.x*scale+width/2,height/2,e.y*scale+depth/2);
      mesh.castShadow=true; mesh.receiveShadow=true; mesh.userData={id:e.id,name:e.name,type:e.type};
      if(isRoom)mesh.visible=false;
      group.add(mesh);
      if(e.type==='room'){
        const outline=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(width,8,depth)),new THREE.LineBasicMaterial({color:0x34d399,transparent:true,opacity:0.65}));
        outline.position.set(e.x*scale+width/2,4,e.y*scale+depth/2);group.add(outline);
      }
    });
  },[els]);

  return <div style={{position:'relative',height:390,border:'1px solid rgba(148,163,184,.18)',borderRadius:16,overflow:'hidden',background:'#07100d',boxShadow:'inset 0 0 50px rgba(16,185,129,.06)'}}>
    <div ref={host} style={{width:'100%',height:'100%'}}/>
    <div style={{position:'absolute',top:12,left:12,padding:'8px 11px',borderRadius:10,background:'rgba(4,12,9,.78)',backdropFilter:'blur(10px)',fontSize:12,color:'#d1fae5',border:'1px solid rgba(52,211,153,.18)'}}>3D MODEL • LIVE SYNC • {els.length} OBJECTS</div>
    <div style={{position:'absolute',bottom:12,right:12,padding:'7px 10px',borderRadius:9,background:'rgba(4,12,9,.72)',fontSize:11,color:'#a7f3d0'}}>Orbit • Pan • Zoom</div>
  </div>;
}
