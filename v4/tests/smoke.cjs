const assert = require('node:assert/strict');
const {chromium} = require('playwright');
(async()=>{
 for(const fallback of [false,true]) {
 const browser=await chromium.launch({headless:true,executablePath:"/usr/bin/chromium",args:fallback?['--disable-webgl']:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const mobile of [false,true]){
 const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:800},hasTouch:mobile,isMobile:mobile});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(process.env.HOUSEWALK_URL||'http://127.0.0.1:8000/v4/');assert.equal(response.status(),200);
 await page.waitForFunction(()=>window.HousewalkBridge);
 if(!fallback) await page.waitForFunction(()=>window.__HW3D_READY===true);
 const colors=await page.evaluate(async(fallback)=>new Promise(resolve=>requestAnimationFrame(()=>{
 const c=document.querySelector(fallback?'#view':'#realView');let pixels;
 if(fallback) pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
 else {const gl=c.getContext('webgl');pixels=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);}
 const colors=new Set();for(let i=0;i<pixels.length;i+=400)colors.add(`${pixels[i]},${pixels[i+1]},${pixels[i+2]}`);resolve(colors.size);
 })),fallback);assert(colors>20,`blank renderer: ${colors}`);
 await page.click('#planBtn');await page.locator('#planModal.open').waitFor();await page.click('#closePlan');assert.equal(await page.locator('#planModal.open').count(),0);
 await page.click('#lightBtn');assert(await page.evaluate(()=>HousewalkBridge.getNight()));await page.click('#lightBtn');
 await page.evaluate(()=>HousewalkBridge.doors.forEach(d=>d.open=true));
 const tour=[];for(let i=0;i<7;i++){await page.click('#tourBtn');tour.push(await page.evaluate(()=>({x:HousewalkBridge.player.x,z:HousewalkBridge.player.z})));}assert.equal(new Set(tour.map(p=>JSON.stringify(p))).size,7);
 assert(await page.evaluate(()=>HousewalkBridge.tourStops.every(p=>!HousewalkBridge.isBlocked(p.x,p.z))),'tour camera intersects furniture');
 await page.click('#resetBtn');assert.equal(await page.evaluate(()=>HousewalkBridge.player.x),.78);
 await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.z<6.30,{},{timeout:15000});await page.keyboard.up('KeyW');assert((await page.evaluate(()=>HousewalkBridge.player.z))<6.33);
 await page.evaluate(()=>Object.assign(HousewalkBridge.player,{x:3.5,z:4.1}));await page.waitForFunction(()=>!document.querySelector('#doorBtn').disabled);const before=await page.evaluate(()=>HousewalkBridge.doors[0].open);await page.click('#doorBtn');assert.equal(await page.evaluate(()=>HousewalkBridge.doors[0].open),!before);
 if(!fallback){
 // Walk into the dining table: the camera must stop in the aisle.
 await page.evaluate(()=>Object.assign(HousewalkBridge.player,{x:2.30,z:4.65,yaw:-Math.PI/2}));
 await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.x<2.10,{},{timeout:15000});await page.waitForTimeout(300);await page.keyboard.up('KeyW');
 assert((await page.evaluate(()=>HousewalkBridge.player.x))>=2.03,'table collision failed');
 // A closed door blocks passage; reopening it permits the same movement.
 await page.evaluate(()=>{HousewalkBridge.doors[0].open=false;Object.assign(HousewalkBridge.player,{x:2.84,z:4.10,yaw:Math.PI/2})});
 await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.x>2.96,{},{timeout:15000});await page.waitForTimeout(300);await page.keyboard.up('KeyW');
 assert((await page.evaluate(()=>HousewalkBridge.player.x))<3.03,'closed bedroom door failed');
 await page.evaluate(()=>HousewalkBridge.doors[0].open=true);
 await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.x>3.44,{},{timeout:15000});await page.keyboard.up('KeyW');
 assert((await page.evaluate(()=>HousewalkBridge.player.x))>3.44,'open bedroom passage failed');
 // Walk the continuous aisle from living through dining into the pantry.
 await page.evaluate(()=>{HousewalkBridge.doors.forEach(d=>d.open=true);Object.assign(HousewalkBridge.player,{x:2.30,z:3.0,yaw:Math.PI})});
 await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.z>5.72,{},{timeout:25000});await page.keyboard.up('KeyW');
 assert((await page.evaluate(()=>HousewalkBridge.player.z))<6.12,'walk entered kitchen cabinets');
 // Probe the counter edge from inside the pantry.
 await page.evaluate(()=>Object.assign(HousewalkBridge.player,{x:3.10,z:5.82,yaw:Math.PI}));
 await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.z>6.06,{},{timeout:15000});await page.waitForTimeout(250);await page.keyboard.up('KeyW');
 assert((await page.evaluate(()=>HousewalkBridge.player.z))<6.14,'kitchen counter collision failed');
 // Pantry-facing bathroom doorway blocks and then admits the same path.
 await page.evaluate(()=>{HousewalkBridge.doors[1].open=false;Object.assign(HousewalkBridge.player,{x:4.28,z:5.86,yaw:Math.PI/2})});
 await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.x>4.48,{},{timeout:15000});await page.waitForTimeout(250);await page.keyboard.up('KeyW');
 assert((await page.evaluate(()=>HousewalkBridge.player.x))<4.57,'closed bathroom door failed');
 await page.evaluate(()=>HousewalkBridge.doors[1].open=true);
 await page.keyboard.down('KeyW');await page.waitForFunction(()=>HousewalkBridge.player.x>5.15,{},{timeout:15000});await page.keyboard.up('KeyW');
 assert(await page.evaluate(()=>HW4Stats.shadowMap),'static shadow map unavailable');
 }
 if(mobile){
 await page.evaluate(()=>Object.assign(HousewalkBridge.player,{x:2.25,z:3.50,yaw:0}));
 const cdp=await page.context().newCDPSession(page),rect=await page.locator('#joy').boundingBox();
 const touch={x:rect.x+rect.width/2,y:rect.y+rect.height/2-30};
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch]});await page.waitForFunction(()=>HousewalkBridge.player.z<3.47,{},{timeout:15000});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert((await page.evaluate(()=>HousewalkBridge.player.z))<3.47,'touch joystick movement failed');
 const yaw=await page.evaluate(()=>HousewalkBridge.player.yaw);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:220,y:420}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:285,y:430}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert((await page.evaluate(()=>HousewalkBridge.player.yaw))>yaw+.1,'touch look failed');
 }
 if(!fallback&&!mobile){
 const supported=await page.evaluate(()=>{const gl=document.querySelector('#realView').getContext('webgl');window.testContextLoss=gl.getExtension('WEBGL_lose_context');if(window.testContextLoss)window.testContextLoss.loseContext();return !!window.testContextLoss});
 assert(supported,'test driver has no context loss extension');
 await page.waitForFunction(()=>window.__HW3D_READY===false);
 assert.equal(await page.locator('#view').evaluate(el=>el.style.opacity),'1');
 await page.evaluate(()=>window.testContextLoss.restoreContext());
 await page.waitForFunction(()=>window.__HW3D_READY===true);
 }
 await page.click('#resetBtn');assert.deepEqual(errors,[]);
 console.log(JSON.stringify({renderer:fallback?'canvas':'webgl',viewport:mobile?'mobile':'desktop',sampledColors:colors,checks:['HTTP','rendered pixels','plan','lighting','7 safe tour stops','reset','movement','door controls',...(!fallback?['table and kitchen collisions','connected living-to-pantry walk','bedroom and bathroom door passage']:[]),...(mobile?['touch joystick and look']:[]),...(!fallback&&!mobile?['WebGL context recovery']:[]),'no page errors']}));await page.close();
 }await browser.close();
 }
})().catch(e=>{console.error(e);process.exit(1)});
