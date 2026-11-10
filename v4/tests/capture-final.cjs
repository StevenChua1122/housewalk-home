const {chromium}=require('playwright');const fs=require('node:fs');const path=require('node:path');
const output=path.resolve(__dirname,'../qa/final');
const views=[
 {name:'01-living-dining',x:1.50,z:6.26,yaw:.10,pitch:.06,eye:1.45,fov:68,w:1672,h:941},
 {name:'02-oak-floor',x:2.02,z:3.20,yaw:0,pitch:-.70,eye:.95,fov:65,w:1672,h:941},
 {name:'03-curtain-window',x:1.80,z:3.20,yaw:.13,pitch:.02,eye:1.45,fov:65,w:1672,h:941},
 {name:'04-kitchen-first',x:2.35,z:4.80,yaw:2.43,pitch:-.01,eye:1.50,fov:75,w:1672,h:941},
 {name:'05-kitchen-second',x:1.25,z:5.60,yaw:1.95,pitch:-.03,eye:1.50,fov:75,w:1672,h:941},
 {name:'06-entrance',x:1.00,z:5.35,yaw:3.10,pitch:-.12,eye:1.40,fov:86,w:1585,h:992}
];
(async()=>{fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const mobile of [false,true]){
 const page=await browser.newPage({viewport:{width:1280,height:800},isMobile:mobile,hasTouch:mobile});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.HOUSEWALK_URL||'http://127.0.0.1:8000/v4/');await page.waitForFunction(()=>window.__HW4_ASSETS&&window.__HW4_MATERIALS,{},{timeout:60000});
 await page.addStyleTag({content:'#toast{display:none!important}'});
 for(const v of views){if(process.env.HW_CAPTURE_VIEW&&v.name!==process.env.HW_CAPTURE_VIEW)continue;if(mobile&&['02-oak-floor','05-kitchen-second'].includes(v.name))continue;
  await page.setViewportSize(mobile?{width:390,height:844}:{width:v.w,height:v.h});
  if(await page.evaluate(v=>HousewalkBridge.isBlocked(v.x,v.z),v))throw Error('Camera collision: '+v.name);
  await page.evaluate(v=>{Object.assign(HousewalkBridge.player,v);Object.assign(HousewalkBridge.camera,{eyeHeight:v.eye,verticalFov:v.fov})},v);
  const frame=await page.evaluate(()=>HWScene.renderer.info.render.frame);
  await page.waitForFunction(f=>HWScene.renderer.info.render.frame>=f+3,frame,{timeout:60000});await page.screenshot({path:path.join(output,`${mobile?'mobile':'desktop'}-${v.name}.png`)});
 }
 console.log(JSON.stringify({viewport:mobile?'mobile':'desktop',errors,stats:await page.evaluate(()=>HW4Stats)}));if(errors.length)throw Error(errors.join('\n'));await page.close();
}await browser.close();fs.writeFileSync(path.join(output,'cameras.json'),JSON.stringify({note:'Repeatable genuine 3D views, source-plan layout; camera lenses are reference fits, not measured EXIF.',views},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
