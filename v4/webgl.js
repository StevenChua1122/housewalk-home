/* Focused PBR rendering replacement. The existing HousewalkBridge owns navigation/UI.
 * All assets are local. No reference photographs, panoramas or mockups are rendered. */
import * as THREE from './vendor/three.module.min.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {interiorDetails} from './mesh-library.js';
import {connectedRoomDetails} from './room-details.js';
import {windowAlcove} from './window-alcove.js';
const bridge=window.HousewalkBridge,L=window.HWLayout;
const old=document.getElementById('view');
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'default'});}catch(error){console.warn('Housewalk: Canvas compatibility renderer',error);}
if(renderer&&bridge&&L){
 const canvas=renderer.domElement;canvas.id='realView';canvas.setAttribute('aria-hidden','true');canvas.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0';old.after(canvas);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#a9bac5');
 const camera=new THREE.PerspectiveCamera(72,1,.06,80);camera.rotation.order='YXZ';camera.layers.enable(2);renderer.info.autoReset=false;
 const pmrem=new THREE.PMREMGenerator(renderer),roomEnv=new RoomEnvironment();scene.environment=pmrem.fromScene(roomEnv,.025).texture;scene.environmentIntensity=.24;roomEnv.dispose();pmrem.dispose();
 THREE.DefaultLoadingManager.onLoad=()=>{window.__HW4_MATERIALS=true;renderer.shadowMap.needsUpdate=true;};
 const loader=new THREE.TextureLoader(),aniso=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 function tex(name,color=false){const t=loader.load('./assets/materials/'+name);t.wrapS=t.wrapT=THREE.MirroredRepeatWrapping;t.anisotropy=aniso;if(color)t.colorSpace=THREE.SRGBColorSpace;return t;}
 const oak=tex('oak-albedo.jpg',true),oakN=tex('oak-normal.webp'),oakR=tex('oak-roughness.jpg');
 const fabric=tex('fabric-color.jpg',true),fabricN=tex('fabric-normal.webp'),cabinetMap=tex('cabinet-weave.jpg',true);
 const standard=(color,roughness=.7,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness,envMapIntensity:.55});
 const wall=standard('#eee5d9',.94),white=standard('#f5f2ea',.50),greyTop=standard('#777775',.48),black=standard('#242424',.38),metal=standard('#b7b6b1',.31,.88);
 const cloth=(color)=>new THREE.MeshPhysicalMaterial({color,map:fabric,normalMap:fabricN,normalScale:new THREE.Vector2(.065,.065),roughness:.90,sheen:.45,sheenColor:new THREE.Color(color),sheenRoughness:.82,envMapIntensity:.18});
 const upholstery=cloth('#77746f'),cream=cloth('#e7dfcf'),taupe=cloth('#a48d74');taupe.normalScale.set(.05,.05);taupe.sheen=.28;taupe.sheenRoughness=.95;
 const floorMat=new THREE.MeshStandardMaterial({map:oak,normalMap:oakN,normalScale:new THREE.Vector2(.085,.085),roughnessMap:oakR,roughness:1,color:'#d9c2a3',metalness:0,envMapIntensity:.38,vertexColors:true});
 const materials=[floorMat,wall,black,cream,upholstery,white,greyTop,metal,taupe,new THREE.MeshStandardMaterial({color:'#d0cbc2',map:cabinetMap,normalMap:fabricN,normalScale:new THREE.Vector2(.09,.09),roughness:.78}),standard('#63503c'),standard('#ded9cd',.55),standard('#a8bcc6',.14,.15),standard('#161a1d',.25),new THREE.MeshStandardMaterial({color:'#fff2d6',emissive:'#ffdfaa',emissiveIntensity:1.5,roughness:.4}),standard('#bba181')];
 metal.envMapIntensity=1.4;
 const fixtureLights=[],nightWindows=[];
 function add(o,cast=true){o.castShadow=cast;o.receiveShadow=true;scene.add(o);return o;}
 function box(x,y,z,w,h,d,m=wall,r=0){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);return add(o,!m.transparent);}
 function bar(a,b,r,m=metal,seg=12){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),seg,1),m);o.position.copy(new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return add(o);}
 function disk(x,y,z,r,h,m){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32),m);o.position.set(x,y,z);return add(o);}
 function wallX(x,a,b){box(x,L.height/2,(a+b)/2,.15,L.height,b-a);}
 function wallZ(z,a,b){box((a+b)/2,L.height/2,z,b-a,L.height,.15);}
 // Floor: 180 mm boards, lengthwise grain, staggered joints and per-board UV variation.
 const fp=[],fn=[],fu=[],fc=[];let seed=13246;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let x=.0,row=0;x<6.3;x+=.18,row++){
  const w=Math.min(.178,6.3-x),start=-((row%4)*.411);
  for(let z=start;z<7.05;z+=1.66){const a=Math.max(0,z),b=Math.min(7.05,z+1.658);if(b-a<.02)continue;
   const u0=rand()*5,v0=rand()*4,flip=rand()>.5?1:-1,shade=.956+rand()*.075;
   const strips=x<4.95&&x+w>4.95?[[x,4.95,a,b],[4.95,x+w,a,Math.min(b,4.43)]]:[[x,x+w,a,x>=4.95?Math.min(b,4.43):b]];
   for(const [xa,xb,za,zb]of strips){if(zb-za<.005)continue;for(const [xx,zz] of [[xa,za],[xa,zb],[xb,zb],[xa,za],[xb,zb],[xb,za]]){fp.push(xx,.015,zz);fn.push(0,1,0);fu.push(u0+(xx-x)*1.65,v0+flip*(zz-a)*.70);fc.push(shade,shade,shade);}}
  }
 }
 const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(fp,3));fg.setAttribute('normal',new THREE.Float32BufferAttribute(fn,3));fg.setAttribute('uv',new THREE.Float32BufferAttribute(fu,2));fg.setAttribute('color',new THREE.Float32BufferAttribute(fc,3));add(new THREE.Mesh(fg,floorMat),false);
 // One inexpensive contact-occlusion field anchors the furniture to the same floor.
 // Authored from collision footprints; no photographic shadows or scene background.
 const aoSize=512,aoBytes=new Uint8Array(aoSize*aoSize*4);
 const contactBounds=L.colliders.filter(b=>(b.x1-b.x0)>.17&&(b.z1-b.z0)>.17);
 for(const x of [.15,1.65])for(const z of [3.85,4.55])contactBounds.push({x0:x-.035,x1:x+.035,z0:z-.035,z1:z+.035});
 for(let j=0;j<aoSize;j++)for(let i=0;i<aoSize;i++){
  const x=i/(aoSize-1)*6.3,z=(1-j/(aoSize-1))*7.05;let shade=0;
  for(const b of contactBounds){const dx=Math.max(b.x0-x,0,x-b.x1),dz=Math.max(b.z0-z,0,z-b.z1),dist=Math.hypot(dx,dz);shade=Math.max(shade,.29*Math.exp(-dist/.09));}
  const k=(j*aoSize+i)*4;aoBytes[k+3]=Math.round(shade*255);
 }
 const contactMap=new THREE.DataTexture(aoBytes,aoSize,aoSize);contactMap.minFilter=contactMap.magFilter=THREE.LinearFilter;contactMap.needsUpdate=true;
 const contactMat=new THREE.MeshBasicMaterial({map:contactMap,transparent:true,depthWrite:false,toneMapped:false});
 const contactPlane=new THREE.Mesh(new THREE.PlaneGeometry(6.3,7.05),contactMat);contactPlane.rotation.x=-Math.PI/2;contactPlane.position.set(3.15,.019,3.525);contactPlane.renderOrder=1;scene.add(contactPlane);

 box(3.15,-.015,3.525,6.3,.04,7.05,standard('#b89c7f',.85));
 // Source-plan shell, horizontally mirrored. The AC ledge is a solid corner, not extra apartment length.
 box(3.15,2.80,3.525,6.45,.06,7.2,wall);
 // Authored ceiling-only diffuse bounce field, not a ray-traced GI bake.
 // Downward fixtures leave ceilings unrealistically grey without reflected floor light.
 const bounceData=new Uint8Array(64*128*4);
 for(let j=0;j<128;j++)for(let i=0;i<64;i++){
  const x=i/63*6.3,z=j/127*7.05;
  let v=.245;for(const [cx,cz]of [[1.7,3.49],[1.7,1.39],[2.22,.48],[.9,4.24],[3.65,5.7],[.85,6.24]])v+=.033*Math.exp(-((x-cx)**2+(z-cz)**2)/1.8);
  const k=(j*64+i)*4;bounceData[k]=v*255;bounceData[k+1]=v*.66*255;bounceData[k+2]=v*.42*255;bounceData[k+3]=255;
 }
 const bounceMap=new THREE.DataTexture(bounceData,64,128);bounceMap.colorSpace=THREE.LinearSRGBColorSpace;bounceMap.minFilter=bounceMap.magFilter=THREE.LinearFilter;bounceMap.channel=1;bounceMap.needsUpdate=true;
 const ceilingMat=wall.clone();ceilingMat.lightMap=bounceMap;ceilingMat.lightMapIntensity=2.8;
 const ceilingGeo=new THREE.PlaneGeometry(6.30,7.05);ceilingGeo.setAttribute('uv1',ceilingGeo.getAttribute('uv').clone());
 const ceiling=new THREE.Mesh(ceilingGeo,ceilingMat);ceiling.rotation.x=Math.PI/2;ceiling.position.set(3.15,2.768,3.525);add(ceiling,false);

 wallX(0,0,7.05);wallX(6.30,0,5.28);wallX(6.30,6.02,7.05);box(6.30,.515,5.65,.15,1.03,.74);box(6.30,2.625,5.65,.15,.29,.74);wallZ(7.05,0,.30);wallZ(7.05,1.32,3.47);wallZ(7.05,4.37,6.30);
 box(3.92,.52,7.05,.90,1.04,.15);box(3.92,2.245,7.05,.90,1.05,.15);
 // Retain source-plan support depth; construct V5 opening / enclosed returns separately.
 box(.675,1.385,.49,1.35,2.77,.98);wallX(3.15,0,4.37);
 const alcove=windowAlcove({scene,L,wall,white,metal});
 box(5.65,1.385,.49,1.30,2.77,.98);box(4.10,.35,0,1.75,.70,.15);box(4.10,2.635,0,1.75,.27,.15);
 // Bedroom entry on south wall; bath entry in upper west wall, traced from the swing arc.
 wallZ(4.37,3.15,3.43);wallZ(4.37,4.27,6.30);box(3.85,2.49,4.37,.84,.56,.15);
 wallX(4.95,5.27,7.05);box(4.95,2.49,4.88,.15,.56,.78);
 // Low white skirting follows solid walls and stops at openings.
 for(const [x,z0,z1] of [[.083,1.0,7.0],[3.065,.05,4.27],[4.865,5.32,7],[6.215,.08,7]])box(x,.055,(z0+z1)/2,.018,.10,z1-z0,white);
 for(const [z,x0,x1] of [[6.965,1.35,4.86],[4.285,3.2,3.39],[4.285,4.31,6.2]])box((x0+x1)/2,.055,z,x1-x0,.10,.018,white);
 // Detail mesh from the established models, with corrected geometry winding and independent PBR maps.
 const {vertices}=interiorDetails();const buckets=new Map();
 for(let i=0;i<vertices.length;i+=36){const ids=[i,i+12,i+24],p=ids.map(k=>new THREE.Vector3(vertices[k],vertices[k+1],vertices[k+2]));
  const face=new THREE.Vector3().subVectors(p[1],p[0]).cross(new THREE.Vector3().subVectors(p[2],p[0]));const normal=new THREE.Vector3(vertices[i+3],vertices[i+4],vertices[i+5]);if(face.dot(normal)<0)[ids[1],ids[2]]=[ids[2],ids[1]];
  const m=Math.round(vertices[i+11]);if(!buckets.has(m))buckets.set(m,{p:[],n:[],uv:[],c:[]});const b=buckets.get(m);
  for(const k of ids){b.p.push(...vertices.slice(k,k+3));b.n.push(...vertices.slice(k+3,k+6));b.uv.push(...vertices.slice(k+6,k+8));const col=new THREE.Color(vertices[k+8],vertices[k+9],vertices[k+10]);col.convertSRGBToLinear();b.c.push(col.r,col.g,col.b);}
 }
 for(const [id,b]of buckets){const geo=new THREE.BufferGeometry();for(const [n,ar,sz]of [['position',b.p,3],['normal',b.n,3],['uv',b.uv,2],['color',b.c,3]])geo.setAttribute(n,new THREE.Float32BufferAttribute(ar,sz));geo.normalizeNormals();const m=materials[id].clone();m.vertexColors=true;add(new THREE.Mesh(geo,m),id!==14);}
 // Grey textured refrigerator surround reaches the ceiling; two narrow mesh racks sit alongside it.
 box(1.752,1.385,6.66,.032,2.77,.76,materials[9]);box(2.553,1.385,6.66,.032,2.77,.76,materials[9]);
 const rackMaterial=standard('#252728',.43,.35);const racks=[];
 for(const x of [1.44,1.65]){const group=new THREE.Group();group.name='Shoe rack '+(racks.length+1);group.userData={shelves:6,width:.18,depth:.50,height:1.22,orientation:'perpendicular to entrance door'};
  const start=scene.children.length;
  for(const xx of [x-.09,x+.09])for(const z of [6.50,6.99])bar([xx,.018,z],[xx,1.16,z],.009,rackMaterial,10);
  for(const z of [6.50,6.99]){for(let k=0;k<12;k++){const a=k*Math.PI/11,b=(k+1)*Math.PI/11;bar([x+.09*Math.cos(a),1.16+.065*Math.sin(a),z],[x+.09*Math.cos(b),1.16+.065*Math.sin(b),z],.009,rackMaterial,8);}}
  for(let level=0;level<6;level++){const y=.018+level*.208;
   for(const xx of [x-.09,x+.09])bar([xx,y,6.50],[xx,y,6.99],.007,rackMaterial,8);
   for(const z of [6.50,6.99])bar([x-.09,y,z],[x+.09,y,z],.007,rackMaterial,8);
   for(let xx=x-.075;xx<x+.08;xx+=.025)bar([xx,y,6.515],[xx,y,6.975],.0018,rackMaterial,4);
   for(let z=6.52;z<6.98;z+=.025)bar([x-.08,y,z],[x+.08,y,z],.0018,rackMaterial,4);
  }
  const children=scene.children.slice(start),geometries=[];
  for(const o of children){o.updateMatrix();const geo=o.geometry.clone();geo.applyMatrix4(o.matrix);geometries.push(geo);scene.remove(o);o.geometry.dispose();}
  const merged=mergeGeometries(geometries,false);const mesh=new THREE.Mesh(merged,rackMaterial);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);for(const g of geometries)g.dispose();scene.add(group);racks.push(group);
 }
 // Entrance construction matches the real photographs: wood leaf, closer, lock, switch and bulkhead.
 const doorWood=standard('#f0eee8',.54);doorWood.map=tex('door-ash.jpg',true);doorWood.normalMap=oakN;doorWood.normalScale=new THREE.Vector2(.08,.08);
 box(.81,1.135,7.005,.98,2.25,.055,doorWood);
 for(const x of [.285,1.335])box(x,1.15,6.967,.055,2.30,.10,doorWood);
 box(.81,2.30,6.967,1.105,.065,.10,doorWood);
 box(.86,2.61,6.90,1.85,.30,.30,wall);box(.81,2.535,7.05,1.02,.47,.15,wall);
 for(const y of [.32,1.32,2.05])bar([.325,y-.06,6.957],[.325,y+.06,6.957],.014,metal,16);
 // Face is toward negative z; handles and closer remain on that face.
 disk(.81,1.47,6.955,.008,.012,black).rotation.x=Math.PI/2;
 bar([1.19,.96,6.945],[1.19,.96,6.89],.021,metal);bar([1.19,.96,6.89],[1.08,.96,6.89],.015,metal);
 box(1.19,.87,6.950,.035,.055,.016,metal);box(.43,2.20,6.931,.20,.065,.055,metal);
 bar([.44,2.23,6.90],[.55,2.36,6.84],.012,metal);bar([.55,2.36,6.84],[.72,2.31,6.96],.010,metal);
 box(1.53,1.40,6.96,.09,.09,.018,white);
 bar([1.35,2.67,.32],[3.10,2.67,.32],.010,metal);
 const glass=alcove.glass;
 // Kitchen glazing is a single operable pane, not a room photograph.
 const kitchenGlass=glass.clone();kitchenGlass.color.set('#afcede');kitchenGlass.roughness=.25;kitchenGlass.opacity=.65;kitchenGlass.emissive.set('#7bacc7');kitchenGlass.emissiveIntensity=.18;box(3.92,1.385,7.015,.85,.59,.006,kitchenGlass,false);
 // Shared exterior geometry gives both north windows a consistent sunlit city view.
 const outside=standard('#cad0c9',.88),blueGlass=standard('#94b9c8',.20,.35),windowGlow=new THREE.MeshStandardMaterial({color:'#94b0b7',emissive:'#c5c6a6',emissiveIntensity:0,roughness:.3});
 for(const bx of [-3.3,1.3,6.1,10.8]){
  const bz=-32-(bx>5?5:0);box(bx,1.3,bz,3.6,19,.8,outside);
  for(let xx=bx-1.45;xx<bx+1.5;xx+=.72)for(let y=-7;y<10;y+=.86){box(xx,y,bz+.425,.49,.61,.025,blueGlass);box(xx,y-.34,bz+.52,.64,.055,.24,outside);if(rand()>.8)box(xx,y,bz+.442,.44,.55,.008,windowGlow);}
 }
 const foliage=new THREE.MeshStandardMaterial({color:'#81915b',roughness:1});
 const trees=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,2),foliage,54),tm=new THREE.Object3D();
 for(let i=0;i<54;i++){tm.position.set(-6+rand()*19,-4.2+rand()*1.2,-14.0-rand()*4.5);tm.scale.set(.38+rand()*.7,.38+rand()*.5,.38+rand()*.7);tm.updateMatrix();trees.setMatrixAt(i,tm.matrix);trees.setColorAt(i,new THREE.Color().setHSL(.20+rand()*.08,.20+rand()*.18,.30+rand()*.15));}scene.add(trees);
 nightWindows.push(windowGlow);box(3.9,2,9.2,4.6,5,.20,wall);
 // Door transforms and navigation share the same source-plan coordinates.
 const doorGroups=[];
 for(const d of L.doors){
  const g=new THREE.Group();g.position.set(d.x,0,d.z);const leaf=new THREE.Mesh(new THREE.BoxGeometry(d.len,2.15,.065),white);leaf.position.set(d.len/2,1.10,0);leaf.castShadow=true;leaf.receiveShadow=true;g.add(leaf);
  const handle=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.12,12),metal);handle.rotation.z=Math.PI/2;handle.position.set(d.len-.14,1.0,-.065);g.add(handle);const otherHandle=handle.clone();otherHandle.position.z=.065;g.add(otherHandle);
  if(d.axis==='x'){
   const rail=new THREE.Mesh(new THREE.BoxGeometry(.40,.018,.022),black);rail.position.set(d.len/2,1.98,-.045);g.add(rail);
   for(let j=0;j<5;j++){const hook=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.085,8),black);hook.position.set(d.len/2-.16+j*.08,1.945,-.058);g.add(hook);}
  }
scene.add(g);doorGroups.push(g);
  if(d.axis==='x'){for(const x of [d.x-.025,d.x+d.len+.025])box(x,1.10,d.z-.05,.05,2.2,.10,white);box(d.x+d.len/2,2.2,d.z-.05,d.len+.10,.05,.10,white);}else{for(const z of [d.z-.025,d.z+d.len+.025])box(d.x-.05,1.10,z,.10,2.2,.05,white);box(d.x-.05,2.2,d.z+d.len/2,.10,.05,d.len+.10,white);}
 }

 const roomShadowLights=[];
 const rooms=connectedRoomDetails({scene,L,bridge,tex,wall,white,metal,black,taupe,cloth,glass:alcove.glass,shadowLights:roomShadowLights});
 // Batch immutable opaque shell/exterior geometry by material. Door/hero/rack groups
 // and sorted glass stay independent. This removes hundreds of tiny exterior draws.
 const staticBatches=new Map();
 for(const o of scene.children){if(!o.isMesh||o.material.transparent||o===ceiling||o.material===floorMat)continue;
  const key=o.material.uuid+':'+Number(o.castShadow);if(!staticBatches.has(key))staticBatches.set(key,[]);staticBatches.get(key).push(o);
 }
 for(const batch of staticBatches.values()){
  if(batch.length<2)continue;const geos=[];
  for(const o of batch){o.updateMatrix();let g=o.geometry.clone();g.applyMatrix4(o.matrix);if(g.index)g=g.toNonIndexed();geos.push(g);}
  const geo=mergeGeometries(geos,false);if(!geo)continue;
  const mesh=new THREE.Mesh(geo,batch[0].material);mesh.castShadow=batch.some(o=>o.castShadow);mesh.receiveShadow=true;scene.add(mesh);
  for(const o of batch){scene.remove(o);o.geometry.dispose();}for(const g of geos)g.dispose();
 }
 // Retained living/kitchen keys; room-details adds two smaller cached bedroom/bath keys.
 const hemi=new THREE.HemisphereLight('#fff0dd','#fff0dd',.72);scene.add(hemi);
 function spot(x,z,intensity,shadow=false,tx=x,tz=z){const l=new THREE.SpotLight('#ffe5cf',intensity,12,1.32,1.0,2);l.position.set(x,2.60,z);l.target.position.set(tx,.2,tz);scene.add(l,l.target);l.castShadow=shadow;if(shadow){l.shadow.mapSize.set(1024,1024);l.shadow.bias=-.00015;l.shadow.normalBias=.025;l.shadow.radius=5;l.shadow.blurSamples=8;l.shadow.camera.near=.12;l.shadow.camera.far=10;}fixtureLights.push(l);return l;}
 spot(1.70,3.49,12,true);spot(1.70,1.39,5).angle=.80;spot(2.22,.48,3.2).angle=.85;
 spot(.45,4.24,7,false,.7,4.2);spot(1.30,4.24,7,false,1.2,4.2);spot(1.78,4.72,7,false,.95,4.2);
 spot(3.65,5.70,15,true,3.85,6.50);spot(.85,6.24,6);
 const task=new THREE.PointLight('#ffebd4',3,2,2);task.position.set(3.7,1.70,6.64);scene.add(task);
 // Actual sunlight is shadowed by the shell, frames, curtains and furniture.
 const daylight=new THREE.DirectionalLight('#ffe3bc',3.8);daylight.position.set(1.4,7,-12);daylight.target.position.set(3.2,0,4.0);scene.add(daylight,daylight.target);
 daylight.castShadow=true;daylight.shadow.mapSize.set(2048,2048);Object.assign(daylight.shadow.camera,{left:-5.2,right:5.2,top:6.3,bottom:-6.3,near:.2,far:35});daylight.shadow.camera.updateProjectionMatrix();daylight.shadow.bias=-.00010;daylight.shadow.normalBias=.012;daylight.shadow.radius=2;daylight.shadow.blurSamples=8;
 const windowBounces=[];for(const x of [2.22,4.10]){const l=new THREE.PointLight('#fff2db',4,4.6,2);l.position.set(x,1.65,.70);scene.add(l);windowBounces.push(l);}
 const fixturePower=fixtureLights.map(l=>l.intensity),roomPower=rooms.lights.map(l=>l.intensity);
 const heroLoader=new GLTFLoader();
 async function hero(file,kind){const gltf=await heroLoader.loadAsync('./assets/models/'+file);const g=gltf.scene;
  if(kind==='sofa'){g.scale.set(.94,1,.90);g.position.z=.12;}
  else if(kind==='curtain'){g.scale.x=.944;g.position.x=.115;g.position.z=-.66;}
  g.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;const name=o.material?.name||'';
   if(kind==='curtain'||name.includes('taupe'))o.material=taupe;
   else if(!name.includes('timber')){const m=o.material.clone();if(name.includes('Grey'))m.color.set('#77736e');if(name.includes('Bedroom grey'))m.color.set('#76716b');if(name.includes('Bedroom cream'))m.color.set('#e5ddce');if(name.includes('Cream'))m.color.set('#e3d9c8');if(name.includes('orange'))m.color.set('#b85c1d');if(name.includes('piping'))m.color.set('#65615b');m.map=fabric;m.sheen=.25;m.sheenColor?.copy(m.color);m.sheenRoughness=.9;m.normalMap=fabricN;m.normalScale=new THREE.Vector2(.065,.065);m.roughness=.90;m.envMapIntensity=.20;o.material=m;}
  });scene.add(g);window.HWScene.heroGroups[kind]=g;return g;
 }
 Promise.all([hero('sofa-tailored.glb','sofa'),hero('curtains-draped.glb','curtain'),hero('bedroom-soft.glb','bedroom')]).then(()=>{window.__HW4_ASSETS=true;renderer.shadowMap.needsUpdate=true;}).catch(e=>console.error('Housewalk asset error',e));
 window.HW3DColliders=L.colliders;window.HWScene={scene,camera,racks,renderer,materials,rooms,alcove,daylight,heroGroups:{}};
 let previousNight=null,doorState='',lastW=0,lastH=0,first=true;
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();window.__HW3D_READY=false;old.style.opacity='1';canvas.style.opacity='0';});
 canvas.addEventListener('webglcontextrestored',()=>location.reload());
 function render(){requestAnimationFrame(render);if(document.hidden||renderer.getContext().isContextLost())return;
  const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,1.5);if(w!==lastW||h!==lastH){renderer.setPixelRatio(dpr);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();lastW=w;lastH=h;}
  const n=!!bridge.getNight();if(n!==previousNight){previousNight=n;rooms.updateNight(n);daylight.intensity=n?.025:3.8;daylight.castShadow=!n;hemi.intensity=n?.72:.48;scene.environmentIntensity=n?.20:.28;ceilingMat.lightMapIntensity=n?2.8:2.0;fixtureLights.forEach((l,i)=>{l.intensity=fixturePower[i]*(n?1:.28);if(i===0||i===6)l.castShadow=n;});rooms.lights.forEach((l,i)=>l.intensity=roomPower[i]*(n?1:.45));windowBounces.forEach(l=>l.intensity=n?0:2.8);scene.background.set(n?'#1a2635':'#b9d6e5');for(const m of nightWindows)m.emissiveIntensity=n?.75:0;renderer.shadowMap.needsUpdate=true;}
  const state=bridge.doors.map(d=>d.open).join();if(state!==doorState){doorState=state;doorGroups.forEach((g,i)=>g.rotation.y=i?(bridge.doors[i].open?0:-Math.PI/2):(bridge.doors[i].open?Math.PI/2:0));renderer.shadowMap.needsUpdate=true;}
  const p=bridge.player,c=bridge.camera||{};camera.position.set(p.x,c.eyeHeight||1.55,p.z);camera.rotation.set(p.pitch,-p.yaw,0,'YXZ');camera.fov=c.verticalFov||(w<h?72:75);camera.updateProjectionMatrix();renderer.info.reset();renderer.render(scene,camera);window.__HW4_FRAME=(window.__HW4_FRAME||0)+1;
  if(first){first=false;window.__HW3D_READY=true;old.style.opacity='0';canvas.style.opacity='1';document.documentElement.dataset.renderer='pbr-final';renderer.shadowMap.needsUpdate=true;}
  window.HW4Stats={triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls,shadowMap:true,ceilingShadows:true,pbr:true,mirrors:rooms.mirrors.length,frame:window.__HW4_FRAME};
 }
 requestAnimationFrame(render);
}
