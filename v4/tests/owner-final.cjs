const {chromium}=require('playwright');const assert=require('node:assert/strict');
const fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto');
const base='131ec19b2cb1bfadffb3ef3dcebaa5bbae5c49a5';
const read=p=>fs.readFileSync(p,'utf8'),old=p=>cp.execFileSync('git',['show',`${base}:${p}`],{encoding:'utf8'});
const segment=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b));
assert.equal(segment(read('v4/room-details.js'),' // Bedroom\'s fixed feature wall',' // Bathroom tile envelope'),segment(old('v4/room-details.js'),' // Bedroom\'s fixed feature wall',' // Bathroom tile envelope'));
assert.equal(segment(read('v4/webgl.js'),' // Entrance construction',' const glass=alcove.glass'),segment(old('v4/webgl.js'),' // Entrance construction',' const glass=alcove.glass'));
assert.equal(segment(read('v4/webgl.js'),' // Source-plan shell',' // Detail mesh'),segment(old('v4/webgl.js'),' // Source-plan shell',' // Detail mesh'));
assert.equal(segment(read('v4/webgl.js'),' // Door transforms',' const roomShadowLights'),segment(old('v4/webgl.js'),' // Door transforms',' const roomShadowLights'));
assert.equal(crypto.createHash('sha256').update(fs.readFileSync('v4/assets/models/bathroom-door-mop.glb')).digest('hex'),'2622acbc2ee0b8213591ff92ae798ea01ab4e75c33a9fdbc336159f79af60abc');
for(const p of ['v4/assets/models/bedroom-soft.glb','v4/assets/models/sofa-tailored.glb','v4/assets/models/curtains-draped.glb','v4/bedroom-rug.js'])assert.equal(cp.execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim(),cp.execFileSync('git',['rev-parse',`${base}:${p}`],{encoding:'utf8'}).trim());
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage({viewport:{width:640,height:480}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.HOUSEWALK_URL||'http://127.0.0.1:8000/v4/');await page.waitForFunction(()=>window.__HW4_ASSETS&&window.__HW4_MATERIALS,{},{timeout:90000});
// Optional software-GPU interaction buffer reduction; geometry and CSS input
// coordinates stay complete. Visual acceptance uses the unmodified capture tool.
if(process.env.HW_PROOF_RENDER_SCALE)await page.evaluate(scale=>{const s=Math.max(.25,Math.min(1,scale));HWScene.renderer.setPixelRatio(1);HWScene.renderer.setSize(Math.round(innerWidth*s),Math.round(innerHeight*s),false);for(const m of HWScene.rooms.mirrors)m.getRenderTarget().setSize(128,128);},Number(process.env.HW_PROOF_RENDER_SCALE));
const proof=await page.evaluate(async()=>{
 const T=await import('/v4/vendor/three.module.min.js'),S=HWScene;S.scene.updateMatrixWorld(true);
 const root=n=>S.scene.getObjectByName(T.PropertyBinding.sanitizeNodeName(n)),bounds=o=>new T.Box3().setFromObject(o);
 const bin=bounds(root('Kitchen separated mesh bin'));
 const rays=(o,p,d)=>new T.Raycaster(new T.Vector3(...p),new T.Vector3(...d),.001,8).intersectObject(o,true);
 // Round 3: aperture is on the window-facing -Z return, perpendicular to
 // the unchanged heater/rail face. A -X ray would validate the former defect.
 const niche=rays(S.scene,[6.112,1.30,5.90],[0,0,1])[0].point.z;
 const front=rays(S.scene,[6.112,1.43,5.90],[0,0,1])[0].point.z;
 const trays=rays(root('Bathroom approved accessories'),[5.08,1,6.69],[0,-1,0]).map(h=>h.point.y).filter(y=>y>.06&&y<.85).sort((a,b)=>b-a).filter((y,i,a)=>i===0||Math.abs(y-a[i-1])>.02);
 const outside=rays(root('Bathroom approved accessories'),[5.30,1,6.69],[0,-1,0]).filter(h=>h.point.y>.06&&h.point.y<.85).length;
 // Count physically separate upper door front surfaces from the exported model.
 const intervals=[];S.scene.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;if(!p)return;const idx=o.geometry.index,N=idx?idx.count:p.count;
  for(let i=0;i<N;i+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,idx?idx.getX(i+j):i+j).applyMatrix4(o.matrixWorld));
   if(v.every(p=>Math.abs(p.z-6.6405)<.001&&p.y>1.77&&p.y<2.56&&p.x>2.59&&p.x<4.90))intervals.push([Math.min(...v.map(p=>p.x)),Math.max(...v.map(p=>p.x))]);}
 });
 const bands=[];for(const r of intervals.sort((a,b)=>a[0]-b[0])){const last=bands.at(-1);if(last&&r[0]<=last[1]+.001)last[1]=Math.max(last[1],r[1]);else bands.push(r);}
 const art=[];root('Kitchen simplified countertop').traverse(o=>{if(o.isMesh&&o.material.name==='IMG_9974 isolated mug artwork'){const b=bounds(o);art.push({width:b.max.x-b.min.x,texture:[o.material.map.image.width,o.material.map.image.height]});}});
 return {binClearance:6.31-bin.max.z,binBounds:[bin.min.x,bin.max.x,bin.min.z,bin.max.z],nicheDepth:niche-front,trays,outside,cabinetDoorBands:bands,mugArtwork:art,hasMop:!!S.doorGroups[1].getObjectByName('Bathroom_inside-door_mop'),decorativePlaque:S.rooms.named.bathPlaque?.userData};
});
assert(proof.binClearance>.59&&proof.binClearance<.62);assert(proof.nicheDepth>.14&&proof.nicheDepth<.16);assert.equal(proof.trays.length,3);assert.equal(proof.outside,0);assert.equal(proof.cabinetDoorBands.length,5);assert.equal(proof.mugArtwork.length,1);assert(proof.mugArtwork[0].width>.22);assert(proof.hasMop);assert.equal(proof.decorativePlaque?.label,'GO BATH');assert.equal(proof.decorativePlaque.electrical,false);
const occlusion=[];
for(const open of [true,false]){
 await page.evaluate(open=>HousewalkBridge.doors[1].open=open,open);const f=await page.evaluate(()=>__HW4_FRAME);await page.waitForFunction(f=>__HW4_FRAME>f+1,f,{timeout:90000});
 occlusion.push(await page.evaluate(async open=>{const T=await import('/v4/vendor/three.module.min.js'),S=HWScene;S.scene.updateMatrixWorld(true);
  const target=new T.Vector3(.39,1.55,-.09).applyMatrix4(S.doorGroups[1].matrixWorld),origin=new T.Vector3(5.25,1.55,6.25),ray=new T.Raycaster(origin,target.clone().sub(origin).normalize(),.001,origin.distanceTo(target)+.03);
  const hits=ray.intersectObjects(S.scene.children,true).filter(h=>!h.object.material?.transparent);let o=hits[0]?.object,firstMop=false;while(o){if(o.name==='Bathroom_inside-door_mop')firstMop=true;o=o.parent;}
  const mop=S.doorGroups[1].getObjectByName('Bathroom_inside-door_mop'),mopBounds=new T.Box3().setFromObject(mop,true);
  const hallwayHidden=open?[[.39,1.55,-.09],[.39,.23,-.10],[.39,1.82,-.095]].map(p=>{
   const target=new T.Vector3(...p).applyMatrix4(S.doorGroups[1].matrixWorld),origin=new T.Vector3(1.5,1.5,6.25),r=new T.Raycaster(origin,target.clone().sub(origin).normalize(),.001,origin.distanceTo(target)+.02);
   const h=r.intersectObjects(S.scene.children,true).find(h=>!h.object.material?.transparent);return h?.object===S.doorGroups[1].children[0];
  }):[];
  return {open,firstMop,firstName:hits[0]?.object.name,firstLeaf:hits[0]?.object===S.doorGroups[1].children[0],handleWorld:target.toArray(),mopVisible:mop.visible,openDegrees:open?90+S.doorGroups[1].rotation.y*180/Math.PI:0,mopWallClearance:open?mopBounds.min.z-4.456:null,hallwayHidden};
 },open));
}
assert.equal(occlusion[0].firstMop,false);assert(occlusion[0].firstLeaf);assert.equal(occlusion[1].firstMop,true);assert(occlusion.every(o=>o.mopVisible));
console.log(JSON.stringify({doorProof:occlusion}));assert(occlusion[0].mopWallClearance>.015);assert(occlusion[0].hallwayHidden.every(Boolean));assert(occlusion[0].openDegrees>70&&occlusion[0].openDegrees<71);
// One continuous fine-joystick route through the connected hallway, kitchen and bath.
await page.evaluate(()=>{HousewalkBridge.doors[1].open=true;Object.assign(HousewalkBridge.player,{x:2.05,z:3.0,yaw:Math.PI,pitch:0})});
const route=[{x:2.05,z:5.55},{x:3.40,z:5.55},{x:3.40,z:4.88},{x:5.27,z:4.88},{x:5.27,z:6.24}],walk=[];
for(const target of route){const start=await page.evaluate(()=>({x:HousewalkBridge.player.x,z:HousewalkBridge.player.z})),dx=target.x-start.x,dz=target.z-start.z,len=Math.hypot(dx,dz);
 await page.evaluate(y=>HousewalkBridge.player.yaw=y,Math.atan2(dx,-dz));const joy=await page.locator('#joy').boundingBox();await page.mouse.move(joy.x+joy.width/2,joy.y+joy.height/2-joy.width*.31*.30);await page.mouse.down();
 await page.waitForFunction(({s,dx,dz,len})=>{const p=HousewalkBridge.player;return ((p.x-s.x)*dx+(p.z-s.z)*dz)/len>=len-.025},{s:start,dx,dz,len},{timeout:90000});await page.mouse.up();
 const p=await page.evaluate(()=>({x:HousewalkBridge.player.x,z:HousewalkBridge.player.z}));assert(Math.hypot(p.x-target.x,p.z-target.z)<.14);assert.equal(await page.evaluate(p=>HousewalkBridge.isBlocked(p.x,p.z),p),false);walk.push(p);console.log(JSON.stringify({walkTarget:target,position:p}));
}
assert.deepEqual(errors,[]);const result={frozenBedroomEntrance:'PASS',frozenArchitectureDoorAndMop:'PASS',geometry:proof,doorOcclusion:occlusion,continuousWalk:walk,errors};const output=process.env.HW_PROOF_DIR||'v4/qa/owner-final';fs.mkdirSync(output,{recursive:true});fs.writeFileSync(output+'/proofs.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
