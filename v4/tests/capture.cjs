const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const output=path.resolve(__dirname,'../qa');
const views=[
 {name:'living-dining',x:2.08,z:5.85,yaw:-.03,pitch:.04},
 {name:'living-windows',x:1.94,z:2.98,yaw:-.04,pitch:-.04},
 {name:'kitchen-from-living',x:2.36,z:4.92,yaw:2.76,pitch:-.04},
 {name:'kitchen-second-angle',x:1.86,z:5.62,yaw:2.28,pitch:-.06}
];
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 fs.mkdirSync(output,{recursive:true});
 for(const mobile of [false,true]){
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.HOUSEWALK_URL||'http://127.0.0.1:8000/v4/');
  await page.waitForFunction(()=>window.__HW3D_READY&&window.__HW4_MATERIALS);
  await page.addStyleTag({content:'#toast{display:none!important}'});
  for(const view of views){
   const pose={...view};
   if(mobile&&view.name==='kitchen-second-angle')pose.yaw=2.40;
   if(await page.evaluate(v=>HousewalkBridge.isBlocked(v.x,v.z),pose))throw Error('Screenshot camera collides: '+view.name);
   await page.evaluate(v=>Object.assign(HousewalkBridge.player,v),pose);
   await page.waitForTimeout(450);
   await page.screenshot({path:path.join(output,`${mobile?'mobile':'desktop'}-${view.name}.png`)});
  }
  await page.click('#lightBtn');await page.waitForTimeout(450);
  await page.screenshot({path:path.join(output,`${mobile?'mobile':'desktop'}-kitchen-evening.png`)});
  console.log(JSON.stringify({viewport:mobile?'mobile':'desktop',errors,stats:await page.evaluate(()=>HW4Stats)}));
  if(errors.length)throw Error(errors.join('\n'));
  await page.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
