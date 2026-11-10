const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
for(const fallback of [false,true]){
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:fallback?['--disable-webgl']:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const mobile of [false,true]){
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:800},hasTouch:mobile,isMobile:mobile});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.HOUSEWALK_URL||'http://127.0.0.1:8000/v4/');await page.waitForFunction(()=>window.HousewalkBridge);
  if(!fallback)await page.waitForFunction(()=>window.__HW4_ASSETS&&window.__HW4_MATERIALS,{},{timeout:60000});
  await page.click('#planBtn');await page.locator('#planModal.open').waitFor();await page.click('#closePlan');
  const night=await page.evaluate(()=>HousewalkBridge.getNight());await page.click('#lightBtn');assert.equal(await page.evaluate(()=>HousewalkBridge.getNight()),!night);await page.click('#lightBtn');
  const stops=[];for(let i=0;i<7;i++){await page.click('#tourBtn');stops.push(await page.evaluate(()=>({x:HousewalkBridge.player.x,z:HousewalkBridge.player.z})));}assert.equal(new Set(stops.map(JSON.stringify)).size,7);
  assert(await page.evaluate(()=>HousewalkBridge.tourStops.every(p=>!HousewalkBridge.isBlocked(p.x,p.z))),'tour stop intersects a wall or object');
  // Shared central aisle: actual keyboard travel, not teleported between rooms.
  await page.evaluate(()=>Object.assign(HousewalkBridge.player,{x:2.05,z:2.40,yaw:Math.PI}));await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.z>5.70,{},{timeout:30000});await page.keyboard.up('KeyW');
  // Counter must stop the camera before it enters the cabinetry.
  await page.evaluate(()=>Object.assign(HousewalkBridge.player,{x:3.40,z:5.75,yaw:Math.PI}));await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.z>6.03,{},{timeout:15000});await page.waitForTimeout(350);await page.keyboard.up('KeyW');assert((await page.evaluate(()=>HousewalkBridge.player.z))<6.15);
  // Bedroom entry in the source plan is on its south wall.
  await page.evaluate(()=>{HousewalkBridge.doors[0].open=false;Object.assign(HousewalkBridge.player,{x:3.85,z:4.85,yaw:0})});
  await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.z<4.66,{},{timeout:15000});await page.waitForTimeout(300);await page.keyboard.up('KeyW');assert((await page.evaluate(()=>HousewalkBridge.player.z))>4.57);
  await page.waitForFunction(()=>!document.querySelector('#doorBtn').disabled);await page.click('#doorBtn');await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.z<4.10,{},{timeout:15000});await page.keyboard.up('KeyW');
  // Bathroom door is in the upper west wall, as indicated by the plan's swing arc.
  await page.evaluate(()=>{HousewalkBridge.doors[1].open=false;Object.assign(HousewalkBridge.player,{x:4.45,z:4.88,yaw:Math.PI/2})});
  await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.x>4.60,{},{timeout:15000});await page.waitForTimeout(300);await page.keyboard.up('KeyW');assert((await page.evaluate(()=>HousewalkBridge.player.x))<4.78);
  await page.waitForFunction(()=>!document.querySelector('#doorBtn').disabled);await page.click('#doorBtn');await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.x>5.28,{},{timeout:15000});await page.keyboard.up('KeyW');
  if(mobile){
   await page.evaluate(()=>Object.assign(HousewalkBridge.player,{x:2.05,z:3.0,yaw:0}));const cdp=await page.context().newCDPSession(page),rect=await page.locator('#joy').boundingBox();
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rect.x+rect.width/2,y:rect.y+rect.height/2-30}]});await page.waitForFunction(()=>HousewalkBridge.player.z<2.90,{},{timeout:15000});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   const yaw=await page.evaluate(()=>HousewalkBridge.player.yaw);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:220,y:410}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:280,y:420}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert((await page.evaluate(()=>HousewalkBridge.player.yaw))>yaw+.1);
  }
  let assets;
  if(!fallback){assets=await page.evaluate(()=>({racks:HWScene.racks.map(r=>({shelves:r.userData.shelves,width:r.userData.width,depth:r.userData.depth,height:r.userData.height})),oak:HWScene.materials[0].map.image.width,pbr:HW4Stats.pbr}));assert.equal(assets.racks.length,2);assert(assets.racks.every(r=>r.shelves===6&&r.width<.25&&r.depth>.45&&r.height<1.33));assert.equal(assets.oak,2048);assert(assets.pbr);}
  await page.click('#resetBtn');assert.equal(await page.evaluate(()=>HousewalkBridge.player.x),.78);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({renderer:fallback?'Canvas':'PBR',viewport:mobile?'mobile':'desktop',passed:['map','day/night','7 safe tours','connected walk','counter collision','both doorway passages',...(mobile?['touch joystick/look']:[])],assets,errors}));await page.close();
 }
 await browser.close();
}
})().catch(e=>{console.error(e);process.exit(1)});
