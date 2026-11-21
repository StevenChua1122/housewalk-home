/* Same frozen inspection pose; close the expensive 3D page before SVG capture. */
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'capture-owner-final.cjs'),'utf8');
const views=vm.runInNewContext(source.match(/const views=(\[[\s\S]*?\n\]);/)[1],{Math});
const v=views.find(v=>v.name==='kitchen-bathroom-measurement');
const output=process.env.HW_CAPTURE_DIR||path.resolve(__dirname,'../qa/visual-refinement');
(async()=>{fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:v.w,height:v.h}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.HOUSEWALK_URL||'http://127.0.0.1:8000/v4/');await page.waitForFunction(()=>window.__HW4_ASSETS&&window.__HW4_MATERIALS,{},{timeout:90000});
 await page.addStyleTag({content:'.ui,.tint{display:none!important}'});
 await page.evaluate(v=>{HousewalkBridge.doors[0].open=true;HousewalkBridge.doors[1].open=false;Object.assign(HousewalkBridge.player,v);Object.assign(HousewalkBridge.camera,{eyeHeight:v.eye,verticalFov:v.fov})},v);
 const f=await page.evaluate(()=>__HW4_FRAME);await page.waitForFunction(f=>__HW4_FRAME>=f+3,f,{timeout:90000});
 await page.screenshot({path:path.join(output,'desktop-'+v.name+'.png'),timeout:90000});
 const record={name:v.name,mobile:false,stats:await page.evaluate(()=>HW4Stats)};if(errors.length)throw Error(errors.join('\n'));await page.close();
 const diagram=await browser.newPage({viewport:{width:1400,height:970}});await diagram.goto(new URL('qa/owner-final/clearance-measurement.svg',process.env.HOUSEWALK_URL||'http://127.0.0.1:8000/v4/').href);await diagram.screenshot({path:path.join(output,'clearance-measurement.png'),timeout:90000});await diagram.close();
 const file=path.join(output,'cameras.json'),manifest=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{views,records:[]};manifest.records=manifest.records.filter(r=>r.name!==v.name||r.mobile);manifest.records.push(record);manifest.measurementCapture='Same frozen pose, separate browser page after closing PBR to prevent software-GPU starvation.';fs.writeFileSync(file,JSON.stringify(manifest,null,2));console.log('Captured full-resolution measurement pose and separate diagram');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
