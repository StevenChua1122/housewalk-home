const {chromium}=require('playwright');const fs=require('node:fs');const path=require('node:path');
const output=process.env.HW_CAPTURE_DIR||path.resolve(__dirname,'../qa/v5-sunlit');
const views=[
 {name:'01-living-dining',x:1.50,z:6.26,yaw:.10,pitch:-.02,eye:1.50,fov:68,w:1448,h:1086,mobile:true},
 {name:'01a-alcove-close',x:1.85,z:3.15,yaw:.04,pitch:0,eye:1.55,fov:76,w:1152,h:1536},
 {name:'01b-alcove-top',x:1.68,z:.95,yaw:0,pitch:-Math.PI/2,eye:2.70,fov:90,w:1400,h:1100,inspection:true},
 {name:'02-oak-floor',x:2.02,z:3.20,yaw:0,pitch:-.70,eye:.95,fov:65,w:1672,h:941},
 {name:'03-living-window',x:1.80,z:2.30,yaw:.17,pitch:.07,eye:1.45,fov:65,w:1200,h:1000},
 {name:'04-bedroom-main',x:3.69,z:3.60,yaw:.68,pitch:.06,eye:1.50,fov:80,w:1672,h:941,bedOpen:true,mobile:true},
 {name:'05-bedroom-reverse',x:4.24,z:.70,yaw:2.76,pitch:-.05,eye:1.48,fov:84,w:1086,h:1448,bedOpen:false},
 {name:'06-bedroom-ac',x:4.72,z:1.36,yaw:1.50,pitch:.40,eye:1.90,fov:65,w:1400,h:1000,bedOpen:true},
 {name:'07-bedroom-rug-top',x:4.75,z:2.20,yaw:0,pitch:-Math.PI/2,eye:2.10,fov:110,w:1400,h:1400,bedOpen:true,inspection:true},
 {name:'08-bedside-side',x:3.85,z:1.48,yaw:1.40,pitch:-.05,eye:1.50,fov:80,w:1536,h:1024,bedOpen:true},
 {name:'09-kitchen',x:2.35,z:4.80,yaw:2.43,pitch:-.01,eye:1.50,fov:75,w:1672,h:941,mobile:true},
 {name:'10-entrance',x:1.00,z:5.35,yaw:3.10,pitch:-.12,eye:1.40,fov:86,w:1585,h:992},
 {name:'11-hallway',x:2.35,z:5.75,yaw:.70,pitch:0,eye:1.50,fov:78,w:1672,h:941,bedOpen:true,mobile:true},
 {name:'12-bathroom-first',x:5.25,z:6.25,yaw:.57,pitch:-.28,eye:1.42,fov:90,w:768,h:1024,bedOpen:true,mobile:true},
 {name:'13-toilet-close',x:5.28,z:6.12,yaw:.97,pitch:-.65,eye:1.20,fov:62,w:1152,h:1280,bedOpen:true},
 {name:'14-bathroom-shower',x:5.30,z:5.10,yaw:2.70,pitch:-.14,eye:1.50,fov:82,w:768,h:1024,bedOpen:true,mobile:true}
];
(async()=>{fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const records=[];
try{for(const mobile of process.env.HW_DESKTOP_ONLY?[false]:[false,true]){
 if(mobile&&!views.some(v=>v.mobile&&(!process.env.HW_CAPTURE_VIEW||process.env.HW_CAPTURE_VIEW.split(',').includes(v.name))))continue;
 const page=await browser.newPage({viewport:{width:1280,height:800},isMobile:mobile,hasTouch:mobile});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.route('**/favicon.ico',r=>r.fulfill({status:204,body:''}));
 await page.goto(process.env.HOUSEWALK_URL||'http://127.0.0.1:8000/v4/');await page.waitForFunction(()=>window.__HW4_ASSETS&&window.__HW4_MATERIALS,{},{timeout:90000});
 await page.addStyleTag({content:'#toast{display:none!important}'});
 for(const v of views){if(process.env.HW_CAPTURE_VIEW&&!process.env.HW_CAPTURE_VIEW.split(',').includes(v.name))continue;if(mobile&&!v.mobile)continue;
  await page.setViewportSize(mobile?{width:390,height:844}:{width:v.w,height:v.h});
  await page.evaluate(v=>{HousewalkBridge.doors[0].open=!!v.bedOpen;HousewalkBridge.doors[1].open=true},v);
  if(!v.inspection&&await page.evaluate(v=>HousewalkBridge.isBlocked(v.x,v.z),v))throw Error('Camera collision: '+v.name);
  await page.evaluate(v=>{Object.assign(HousewalkBridge.player,v);Object.assign(HousewalkBridge.camera,{eyeHeight:v.eye,verticalFov:v.fov})},v);
  await page.waitForTimeout(130);const f=await page.evaluate(()=>window.__HW4_FRAME);await page.waitForFunction(f=>window.__HW4_FRAME>=f+3,f,{timeout:90000});
  await page.screenshot({timeout:90000,path:path.join(output,`${mobile?'mobile':'desktop'}-${v.name}.png`)});
  records.push({name:v.name,mobile,stats:await page.evaluate(()=>HW4Stats)});
  if(process.env.HW_SUN_DIAGNOSTIC)console.log('Sun ray blockers',await page.evaluate(async()=>{const T=await import('/v4/vendor/three.module.min.js'),dir=HWScene.daylight.position.clone().sub(HWScene.daylight.target.position).normalize();HWScene.scene.updateMatrixWorld(true);return [2,3,4].map(z=>{const p=new T.Vector3(2.4,.04,z),r=new T.Raycaster(p,dir,.01,60);const h=r.intersectObjects(HWScene.scene.children,true).find(h=>h.object.castShadow);return {z,distance:h?.distance,hit:h?[h.point.x,h.point.y,h.point.z]:null,name:h?.object.name,material:h?.object.material?.color?.getHexString()}});}));
 }
 console.log(JSON.stringify({viewport:mobile?'mobile':'desktop',errors,views:records.filter(r=>r.mobile===mobile).map(r=>({name:r.name,triangles:r.stats.triangles,calls:r.stats.drawCalls}))}));
 if(errors.length)throw Error(errors.join('\n'));await page.close();
}const manifest=path.join(output,'cameras.json');let previous=[];if(process.env.HW_CAPTURE_VIEW&&fs.existsSync(manifest))previous=JSON.parse(fs.readFileSync(manifest)).records||[];const combined=[...previous.filter(p=>!records.some(r=>r.name===p.name&&r.mobile===p.mobile)),...records];fs.writeFileSync(manifest,JSON.stringify({note:'Actual sunny PBR scene. No objects hidden or moved. Camera/furniture/window heights are estimates. Top-down inspection poses are below the ceiling, not walking poses. Living wide retains V3 floor position/lens; eye/pitch are fitted to the new reference framing. Bedroom camera remains in the actual entry aisle.',views,records:combined},null,2));}
finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
