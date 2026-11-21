/* Drain the completed WebGL frame before lossless screenshot readback.
 * Cameras, resolution, materials and connected scene objects remain unchanged.
 * SwiftShader can otherwise keep queuing full-resolution frames during readback.
 * Usage: node v4/tests/capture-still.cjs v4/tests/capture-owner-final.cjs
 */
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const target=path.resolve(process.argv[2]||path.join(__dirname,'capture-owner-final.cjs'));
const launch=chromium.launch.bind(chromium);
chromium.launch=async function(options){
 const browser=await launch(options),newPage=browser.newPage.bind(browser);
 browser.newPage=async function(options){
  const page=await newPage(options);
  await page.addInitScript(()=>{
   const raf=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=function(callback){
    if(callback.name!=='render')return raf(callback);
    window.__HW_CAPTURE_RENDER=callback;window.__HW_CAPTURE_PENDING=true;
    return raf(t=>{window.__HW_CAPTURE_PENDING=false;if(!window.__HW_CAPTURE_PAUSED)callback(t)});
   };
   window.__HW_CAPTURE_RESUME=()=>{
    window.__HW_CAPTURE_PAUSED=false;
    if(!window.__HW_CAPTURE_PENDING&&window.__HW_CAPTURE_RENDER)window.requestAnimationFrame(window.__HW_CAPTURE_RENDER);
   };
  });
  const screenshot=page.screenshot.bind(page);
  page.screenshot=async function(options){
   await page.evaluate(()=>window.__HW_CAPTURE_PAUSED=true);
   try{return await screenshot({...options,timeout:180000})}
   finally{await page.evaluate(()=>window.__HW_CAPTURE_RESUME?.())}
  };
  return page;
 };
 return browser;
};
process.once('beforeExit',()=>{
 const out=process.env.HW_CAPTURE_DIR;
 if(!out)return;
 const file=path.join(out,'still-capture-method.json');
 let records=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)).scripts:[];
 records=records.filter(r=>r.script!==path.basename(target));
 records.push({script:path.basename(target),sha256:crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex')});
 fs.writeFileSync(file,JSON.stringify({method:'Pause only WebGL render scheduling after completed capture frames, drain GPU readback, resume after PNG. No mesh, camera, light, material, framing or resolution change.',scripts:records},null,2));
});
require(target);
