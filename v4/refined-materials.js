import * as THREE from './vendor/three.module.min.js';
// Apply physically distinct support maps to authored assets. Product artwork is
// retained intact; no source room image participates in this material system.
export function refinedMaterials(tex){
 const cache=new Map(),emissives=[];let nightState=false;
 const weave={map:tex('refined-weave-color.jpg',true),normal:tex('refined-weave-normal.webp'),rough:tex('refined-weave-roughness.jpg')};
 const cabinet={map:tex('refined-cabinet-color.jpg',true),normal:tex('refined-cabinet-normal.webp'),rough:tex('refined-cabinet-roughness.jpg')};
 const stone={map:tex('refined-stone-color.jpg',true),normal:tex('refined-stone-normal.webp'),rough:tex('refined-stone-roughness.jpg')};
 const steel={normal:tex('refined-steel-normal.webp'),rough:tex('refined-steel-roughness.jpg')};
 const oak=tex('oak-albedo.jpg',true),oakN=tex('oak-normal.webp');
 function material(old){
  if(cache.has(old.uuid))return cache.get(old.uuid);
  const name=old.name||'',n=name.toLowerCase();
  if(n.includes('img_9974')){old.roughness=.26;old.envMapIntensity=.75;cache.set(old.uuid,old);return old;}
  const m=new THREE.MeshPhysicalMaterial({name,color:old.color.clone(),roughness:old.roughness,metalness:old.metalness,side:old.side,transparent:old.transparent,opacity:old.opacity,depthWrite:!old.transparent,envMapIntensity:.65});
  // Closed manufactured shells need front-face rendering. Their hidden backs
  // must not depth-fight with the fixed wall where the carcass touches it.
  if(n.includes('cabinet laminate')||n.includes('cabinet lacquer')||n.includes('white enamel'))m.side=THREE.FrontSide;
  m.vertexColors=old.vertexColors;
  m.emissive.copy(old.emissive);m.emissiveIntensity=old.emissiveIntensity||1;
  if(n.includes('textile')){m.map=weave.map;m.normalMap=weave.normal;m.normalScale.set(.09,.09);m.roughnessMap=weave.rough;m.roughness=1;m.sheen=.42;m.sheenColor.copy(m.color);m.sheenRoughness=.92;m.envMapIntensity=.28;}
  else if(n.includes('cabinet laminate')){m.map=cabinet.map;m.normalMap=cabinet.normal;m.normalScale.set(.035,.035);m.roughnessMap=cabinet.rough;m.roughness=.95;m.envMapIntensity=.55;}
  else if(n.includes('timber')){m.map=oak;m.normalMap=oakN;m.normalScale.set(.10,.10);m.roughness=.48;m.envMapIntensity=.65;}
  else if(n.includes('stone countertop')){m.map=stone.map;m.normalMap=stone.normal;m.normalScale.set(.055,.055);m.roughnessMap=stone.rough;m.roughness=.50;m.clearcoat=.12;m.clearcoatRoughness=.30;}
  else if(n.includes('brushed')||n.includes('stainless')||n.includes('chrome')){m.envMapIntensity=1.85;if(!n.includes('polished')){m.normalMap=steel.normal;m.normalScale.set(.012,.045);m.roughnessMap=steel.rough;m.roughness=.42;}}
  else if(n.includes('clear acrylic')){m.roughness=.15;m.clearcoat=1;m.clearcoatRoughness=.12;m.envMapIntensity=1.0;}
  else if(n.includes('smoked glass')){m.roughness=.12;m.metalness=.28;m.clearcoat=1;m.clearcoatRoughness=.08;m.envMapIntensity=1.5;}
  else if(n.includes('porcelain')){m.roughness=.20;m.clearcoat=.18;m.clearcoatRoughness=.18;m.envMapIntensity=.85;}
  else if(n.includes('polymer')||n.includes('plastic')||n.includes('enamel')||n.includes('lacquer')){m.clearcoat=.08;m.clearcoatRoughness=.34;m.envMapIntensity=.65;}
  else if(n.includes('straw')){m.normalMap=steel.normal;m.normalScale.set(.035,.12);m.roughness=.96;m.envMapIntensity=.25;}
  if(n.includes('fixture lens')){m.emissive.set('#ffe5c5');m.emissiveIntensity=nightState?1.15:.75;emissives.push(m);}
  cache.set(old.uuid,m);return m;
 }
 return {material,apply(g){g.traverse(o=>{if(o.isMesh&&o.material){o.material=material(o.material);o.castShadow=!o.material.transparent;o.receiveShadow=true;}});},updateNight(n){nightState=!!n;for(const m of emissives)m.emissiveIntensity=nightState?1.15:.75;}};
}
