const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const output=process.env.HW_CAPTURE_DIR||path.resolve(__dirname,'../qa/owner-final');
const views=[
 {name:'hallway',x:1.50,z:6.25,yaw:.42,pitch:0,eye:1.50,fov:76,w:1448,h:1086},
 {name:'kitchen',x:3.40,z:4.65,yaw:3.05,pitch:-.14,eye:1.50,fov:80,w:1448,h:1086},
 {name:'bathroom-first',x:5.25,z:6.25,yaw:.57,pitch:-.28,eye:1.42,fov:90,w:768,h:1024},
 {name:'bathroom-shower',x:5.30,z:5.10,yaw:2.70,pitch:-.14,eye:1.50,fov:82,w:768,h:1024},
 {name:'bathroom-closed',x:5.43,z:6.36,yaw:.20,pitch:-.24,eye:1.42,fov:92,w:1086,h:1448,closed:true},
 {name:'mug-detail',x:3.51,z:6.02,yaw:Math.PI,pitch:-.28,eye:1.12,fov:48,w:1000,h:800,detail:true},
 {name:'kitchen-bathroom-measurement',x:4.15,z:5.65,yaw:0,pitch:-Math.PI/2,eye:2.65,fov:70,w:1448,h:1086,inspection:true,detail:true,closed:true},
 {name:'bathroom-door-top-down',x:5.55,z:5.74,yaw:0,pitch:-Math.PI/2,eye:2.65,fov:56,w:1086,h:1448,inspection:true,detail:true,closed:true}
];
(async()=>{fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const records=[];
try{for(const mobile of process.env.HW_DESKTOP_ONLY?[false]:[false,true]){
 const page=await browser.newPage({viewport:{width:800,height:600},isMobile:mobile,hasTouch:mobile});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await page.route('**/favicon.ico',r=>r.fulfill({status:204,body:''}));
 await page.goto(process.env.HOUSEWALK_URL||'http://127.0.0.1:8000/v4/');await page.waitForFunction(()=>window.__HW4_ASSETS&&window.__HW4_MATERIALS,{},{timeout:90000});
 // Clean scene evidence. Only HTML HUD is suppressed; scene objects stay present.
 await page.addStyleTag({content:'.ui,.tint{display:none!important}'});
 for(const v of views){if(process.env.HW_CAPTURE_VIEW&&!process.env.HW_CAPTURE_VIEW.split(',').includes(v.name))continue;if(mobile&&v.detail)continue;
  await page.setViewportSize(mobile?{width:390,height:844}:{width:v.w,height:v.h});
  await page.evaluate(v=>{HousewalkBridge.doors[0].open=true;HousewalkBridge.doors[1].open=!v.closed},v);
  if(!v.inspection&&await page.evaluate(v=>HousewalkBridge.isBlocked(v.x,v.z),v))throw Error('Camera collision: '+v.name);
  await page.evaluate(v=>{Object.assign(HousewalkBridge.player,v);Object.assign(HousewalkBridge.camera,{eyeHeight:v.eye,verticalFov:v.fov})},v);
  const f=await page.evaluate(()=>window.__HW4_FRAME);await page.waitForFunction(f=>window.__HW4_FRAME>=f+3,f,{timeout:90000});
  await page.screenshot({timeout:90000,path:path.join(output,`${mobile?'mobile':'desktop'}-${v.name}.png`)});
  records.push({name:v.name,mobile,stats:await page.evaluate(()=>HW4Stats)});console.log('Captured '+(mobile?'mobile ':'desktop ')+v.name);
  if(v.name==='kitchen-bathroom-measurement'&&!mobile){
   const diagram=await browser.newPage({viewport:{width:1400,height:970}});
   const url=new URL('qa/owner-final/clearance-measurement.svg',process.env.HOUSEWALK_URL||'http://127.0.0.1:8000/v4/');
   await diagram.goto(url.href);await diagram.screenshot({path:path.join(output,'clearance-measurement.png')});await diagram.close();
  }
 }
 if(errors.length)throw Error(errors.join('\n'));await page.close();
}const manifest=path.join(output,'cameras.json');let previous=[];if(process.env.HW_CAPTURE_VIEW&&fs.existsSync(manifest))previous=JSON.parse(fs.readFileSync(manifest)).records||[];const combined=[...previous.filter(p=>!records.some(r=>r.name===p.name&&r.mobile===p.mobile)),...records];fs.writeFileSync(manifest,JSON.stringify({note:'Actual connected PBR scene. HUD only hidden; no scene objects moved/hidden. Photo-fit eye/lens estimates. First/shower bathroom poses retained from PR #7; hallway/kitchen/closed-door lenses fitted to latest locked compositions.',views,records:combined},null,2));}
finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
