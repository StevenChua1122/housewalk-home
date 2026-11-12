const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
for(const fallback of [false,true]){
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:fallback?['--disable-webgl']:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const mobile of [false,true]){
  const caseName=(fallback?'canvas':'pbr')+'-'+(mobile?'mobile':'desktop');if(process.env.HW_SMOKE_CASE&&!process.env.HW_SMOKE_CASE.split(',').includes(caseName))continue;
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:800,height:600},hasTouch:mobile,isMobile:mobile});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.HOUSEWALK_URL||'http://127.0.0.1:8000/v4/');await page.waitForFunction(()=>window.HousewalkBridge);
  if(!fallback)await page.waitForFunction(()=>window.__HW4_ASSETS&&window.__HW4_MATERIALS,{},{timeout:90000});
  await page.click('#planBtn');await page.locator('#planModal.open').waitFor();await page.click('#closePlan');
  const night=await page.evaluate(()=>HousewalkBridge.getNight());await page.click('#lightBtn');assert.equal(await page.evaluate(()=>HousewalkBridge.getNight()),!night);await page.click('#lightBtn');
  const stops=[];for(let i=0;i<7;i++){await page.click('#tourBtn');stops.push(await page.evaluate(()=>({x:HousewalkBridge.player.x,z:HousewalkBridge.player.z})));}assert.equal(new Set(stops.map(JSON.stringify)).size,7);
  assert(await page.evaluate(()=>HousewalkBridge.tourStops.every(p=>!HousewalkBridge.isBlocked(p.x,p.z))),'tour stop intersects a wall or object');
  // Shared central aisle: actual keyboard travel, not teleported between rooms.
  await page.evaluate(()=>Object.assign(HousewalkBridge.player,{x:2.05,z:2.40,yaw:Math.PI}));await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.z>5.70,{},{timeout:90000});await page.keyboard.up('KeyW');
  // Counter must stop the camera before it enters the cabinetry.
  await page.evaluate(()=>Object.assign(HousewalkBridge.player,{x:3.40,z:5.75,yaw:Math.PI}));await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.z>6.03,{},{timeout:45000});await page.waitForTimeout(350);await page.keyboard.up('KeyW');assert((await page.evaluate(()=>HousewalkBridge.player.z))<6.15);
  // Enter the actual recessed niche on the continuous living floor.
  await page.evaluate(()=>Object.assign(HousewalkBridge.player,{x:2.05,z:1.50,yaw:0}));await page.keyboard.down('KeyW');await page.waitForFunction(()=>{const p=HousewalkBridge.player;return p.z<.35&&HousewalkBridge.isBlocked(p.x,p.z-.03)},{},{timeout:60000});await page.keyboard.up('KeyW');const alcoveStop=await page.evaluate(()=>HousewalkBridge.player.z);assert(alcoveStop>=.26&&alcoveStop<.31);
  // Bedroom entry in the source plan is on its south wall.
  await page.evaluate(()=>{HousewalkBridge.doors[0].open=false;Object.assign(HousewalkBridge.player,{x:3.85,z:4.85,yaw:0})});
  await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.z<4.66,{},{timeout:45000});await page.waitForTimeout(300);await page.keyboard.up('KeyW');assert((await page.evaluate(()=>HousewalkBridge.player.z))>4.57);
  await page.waitForFunction(()=>!document.querySelector('#doorBtn').disabled);await page.click('#doorBtn');await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.z<4.10,{},{timeout:45000});await page.keyboard.up('KeyW');
  // Walk the real bedroom aisle and turn around the bed toward the AC corner.
  await page.evaluate(()=>HousewalkBridge.player.yaw=0);await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.z<1.41,{},{timeout:90000});await page.keyboard.up('KeyW');
  await page.evaluate(()=>{HousewalkBridge.player.yaw=Math.PI/2});await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.x>5.20,{},{timeout:90000});await page.keyboard.up('KeyW');
  // Bathroom door is in the upper west wall, as indicated by the plan's swing arc.
  await page.evaluate(()=>{HousewalkBridge.doors[1].open=false;Object.assign(HousewalkBridge.player,{x:4.45,z:4.88,yaw:Math.PI/2})});
  await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.x>4.60,{},{timeout:45000});await page.waitForTimeout(300);await page.keyboard.up('KeyW');assert((await page.evaluate(()=>HousewalkBridge.player.x))<4.78);
  await page.waitForFunction(()=>!document.querySelector('#doorBtn').disabled);await page.click('#doorBtn');await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.x>5.28,{},{timeout:45000});await page.keyboard.up('KeyW');
  // Continue inside the same narrow bathroom into the shower circulation area.
  await page.evaluate(()=>HousewalkBridge.player.yaw=0);const fineJoy=await page.locator('#joy').boundingBox();await page.mouse.move(fineJoy.x+fineJoy.width/2-5,fineJoy.y+fineJoy.height/2);await page.mouse.down();await page.waitForFunction(()=>HousewalkBridge.player.x<5.30,{},{timeout:45000});await page.mouse.up();console.log(JSON.stringify({bathroomAlignment:caseName,position:await page.evaluate(()=>({x:HousewalkBridge.player.x,z:HousewalkBridge.player.z}))}));await page.keyboard.down('KeyS');await page.waitForFunction(()=>HousewalkBridge.player.z>6.24,{},{timeout:90000});await page.keyboard.up('KeyS');
  if(mobile){
   await page.evaluate(()=>Object.assign(HousewalkBridge.player,{x:2.05,z:3.0,yaw:0}));const cdp=await page.context().newCDPSession(page),rect=await page.locator('#joy').boundingBox();
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rect.x+rect.width/2,y:rect.y+rect.height/2-30}]});await page.waitForFunction(()=>HousewalkBridge.player.z<2.90,{},{timeout:45000});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   const yaw=await page.evaluate(()=>HousewalkBridge.player.yaw);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:220,y:410}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:280,y:420}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert((await page.evaluate(()=>HousewalkBridge.player.yaw))>yaw+.1);
  }
  let assets;
  if(!fallback){assets=await page.evaluate(()=>({racks:HWScene.racks.map(r=>({shelves:r.userData.shelves,width:r.userData.width,depth:r.userData.depth,height:r.userData.height})),oak:HWScene.materials[0].map.image.width,pbr:HW4Stats.pbr}));assert.equal(assets.racks.length,2);assert(assets.racks.every(r=>r.shelves===6&&r.width<.25&&r.depth>.45&&r.height<1.33));assert.equal(assets.oak,2048);assert(assets.pbr);}
  if(!fallback){
   const proof=await page.evaluate(async()=>{
    const T=await import('/v4/vendor/three.module.min.js'),R=HWScene.rooms;
    const cabinet=R.named['Bedroom corner cabinet'];cabinet.updateMatrixWorld(true);const b=new T.Box3().setFromObject(cabinet);
    const ac=R.named['Bedroom wall AC'];ac.updateMatrixWorld(true);const a=new T.Box3().setFromObject(ac);
    return {cmin:[b.min.x,b.min.z],cmax:[b.max.x,b.max.z],underAC:(b.min.x+b.max.x)/2>=a.min.x&&(b.min.x+b.max.x)/2<=a.max.x&&b.max.y<a.min.y,
     perpendicular:new T.Vector3(...cabinet.userData.frontNormal).dot(new T.Vector3(...cabinet.userData.acWallNormal)),
     count:HWScene.scene.getObjectsByProperty('name','Bedroom corner cabinet').length,lamp:R.named.lamp.userData,plain:R.named['Bathroom plain round mirror'].userData,
     rugCount:HWScene.scene.getObjectsByProperty('name','Bedroom cat-shaped runner').length};
   });
   assert(proof.underAC);assert.equal(proof.perpendicular,0);assert.equal(proof.count,1);assert(proof.cmin[0]>5.75&&proof.cmax[1]<1.59);assert.equal(proof.lamp.heads,2);assert(proof.lamp.floorStanding);assert.equal(proof.plain.backlight,false);assert.equal(proof.rugCount,1);
   // Check real mesh clearance, continuous alcove surfaces and bed occlusion.
   const geometry=await page.evaluate(async()=>{
    const T=await import('/v4/vendor/three.module.min.js'),S=HWScene;
    S.scene.updateMatrixWorld(true);
    const ac=S.rooms.named['Bedroom wall AC'],acBounds=new T.Box3().setFromObject(ac),caseBounds=new T.Box3().setFromObject(ac.children[1]);
    const cast=(p,d)=>new T.Raycaster(new T.Vector3(...p),new T.Vector3(...d)).intersectObjects(S.scene.children,true).filter(h=>!h.object.material?.transparent)[0];
    const ceiling=[.25,.85,1.15].map(z=>cast([2.40,2.25,z],[0,1,0])?.point.y);
    const floor=[.27,.70,1.18].map(z=>cast([2.05,.20,z],[0,-1,0])?.point.y);
    const origin=new T.Vector3(3.69,1.50,3.60);let rugHidden=true;
    for(const x of [4.45,4.70,5.0,5.30,5.57])for(const z of [1.15,1.31,1.47]){const target=new T.Vector3(x,.033,z),direction=target.clone().sub(origin),distance=direction.length();const ray=new T.Raycaster(origin,direction.normalize(),0,distance-.01);if(!ray.intersectObject(S.heroGroups.bedroom,true).length)rugHidden=false;}
    const bowl=S.rooms.named.toilet.getObjectByName('Bathroom toilet ceramic bowl and pedestal');const vertices=bowl.geometry.getAttribute('position').count;
    return {acRear:acBounds.min.z,caseRear:caseBounds.min.z,padFront:new T.Box3().setFromObject(ac.children[0]).max.z,acSupported:acBounds.min.x>5&&acBounds.max.x<6.3,ceiling,floor,rugHidden,vertices,sun:S.daylight.intensity};
   });
   console.log(JSON.stringify({geometryProof:mobile?'mobile':'desktop',...geometry}));
   assert(geometry.acRear>=.9799&&geometry.caseRear>.98&&geometry.acSupported);assert(Math.abs(geometry.padFront-geometry.caseRear)<.002);
   assert(geometry.ceiling.every(y=>Math.abs(y-2.768)<.005),'alcove ceiling has a false dropped beam');
   assert(geometry.floor.every(y=>y>=.014&&y<=.020),'alcove floor is not continuous');assert(geometry.rugHidden,'cat runner protrudes into approved main view');assert(geometry.vertices>9000);assert(geometry.sun>1);
   // Reverse view is camera framing, with vanity/mirror still physically present.
   await page.evaluate(()=>{Object.assign(HousewalkBridge.player,{x:4.24,z:.70,yaw:2.76,pitch:-.05});Object.assign(HousewalkBridge.camera,{eyeHeight:1.48,verticalFov:84});HousewalkBridge.doors[0].open=false;});
   const f=await page.evaluate(()=>__HW4_FRAME);await page.waitForFunction(f=>__HW4_FRAME>f+2,f,{timeout:90000});
   const framed=await page.evaluate(async()=>{const T=await import('/v4/vendor/three.module.min.js');const c=HWScene.camera.clone();c.aspect=1086/1448;c.updateProjectionMatrix();c.updateMatrixWorld();const fr=new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(c.projectionMatrix,c.matrixWorldInverse));
    return ['Bedroom full-length mirror','Bedroom side-wall vanity'].map(n=>{const o=HWScene.rooms.named[n];o.updateMatrixWorld(true);return {name:n,visible:o.visible,inFrame:fr.intersectsBox(new T.Box3().setFromObject(o))}});
   });assert(framed.every(o=>o.visible&&!o.inFrame));
  }
  await page.click('#resetBtn');assert.equal(await page.evaluate(()=>HousewalkBridge.player.x),.78);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({renderer:fallback?'Canvas':'PBR',viewport:mobile?'mobile':'desktop',passed:['map','day/night','7 safe tours','connected walk','alcove walking','counter collision','both doorway passages','bedroom aisle and AC-corner access','bathroom-to-shower access',...(mobile?['touch joystick/look']:[])],assets,errors}));await page.close();
 }
 await browser.close();
}
})().catch(e=>{console.error(e);process.exit(1)});
