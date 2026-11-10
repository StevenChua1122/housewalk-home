// Review captures, not an assertion of survey calibration. No app features are added.
const {chromium}=require('playwright');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'../..'),out=process.env.HOUSEWALK_REVIEW_OUTPUT||path.join(__dirname,'captures');
const views=[
 {name:'living',width:1280,height:800,x:1.65,z:6.02,yaw:0,pitch:.02,eye:1.50,fov:58},
 {name:'window',width:1280,height:800,x:1.94,z:2.98,yaw:-.04,pitch:-.04,eye:1.59,fov:58},
 {name:'kitchen-1',width:1280,height:400,x:2.30,z:4.36,yaw:2.85,pitch:-.02,eye:1.50,fov:58},
 {name:'kitchen-2',width:1280,height:400,x:2.20,z:4.85,yaw:2.40,pitch:-.02,eye:1.50,fov:58}
];
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const original=(file)=>execFileSync('git',['show',`8bfe413:${file}`],{cwd:root,encoding:'utf8'});
 const baselineHTML=original('v4/index.html');
 // Only camera uniforms are overridden for PR3: identical lens/pose isolates geometry.
 const baselineJS=original('v4/webgl.js').replace('const fv=1/Math.tan((window.innerWidth<window.innerHeight?70:77)*Math.PI/360);','const fv=1/Math.tan((bridge.camera?.verticalFov||77)*Math.PI/360);').replace('gl.uniform3f(uni.cam,p.x,1.59,p.z);','gl.uniform3f(uni.cam,p.x,bridge.camera?.eyeHeight||1.59,p.z);');
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const baseline of [true,false]){
  const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  if(baseline){await page.route('**/v4/',r=>r.fulfill({contentType:'text/html',body:baselineHTML}));await page.route('**/webgl.js*',r=>r.fulfill({contentType:'text/javascript',body:baselineJS}));}
  await page.goto(process.env.HOUSEWALK_URL||'http://127.0.0.1:8000/v4/');await page.waitForFunction(()=>window.__HW3D_READY&&window.__HW4_MATERIALS);
  await page.addStyleTag({content:'.ui,.hint,#toast{visibility:hidden!important}'});
  for(const v of views){
   await page.setViewportSize({width:v.width,height:v.height});
   const blocked=await page.evaluate(v=>HousewalkBridge.isBlocked(v.x,v.z),v);if(blocked)throw Error('camera collides: '+v.name);
   await page.evaluate(v=>{Object.assign(HousewalkBridge.player,v);HousewalkBridge.camera={eyeHeight:v.eye,verticalFov:v.fov}},v);
   await page.waitForTimeout(350);await page.screenshot({path:path.join(out,`${v.name}-${baseline?'pr3':'candidate'}.png`)});
  }
  console.log(JSON.stringify({model:baseline?'PR3':'candidate',errors,stats:await page.evaluate(()=>HW4Stats)}));if(errors.length)throw Error(errors.join('\n'));
  await page.close();
 }
 fs.writeFileSync(path.join(out,'camera-poses.json'),JSON.stringify({status:'VISUAL FIT ESTIMATES, NOT SURVEY CALIBRATED; review views are collision-clear, not exact reference matches',views},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
