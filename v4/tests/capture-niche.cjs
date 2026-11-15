/* Actual scene inspection, separate from the immutable walkthrough cameras. */
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process');
const output=process.env.HW_CAPTURE_DIR||'v4/qa/niche-round3';
const base='6cf8d6b5aacb20bc405279db24931bd060bd0120';
const current=fs.readFileSync('v4/room-details.js','utf8'),old=cp.execFileSync('git',['show',base+':v4/room-details.js'],{encoding:'utf8'});
const part=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b));
for(const [a,b]of [["  box(5.95,1.68,6.24",'  // The three triangular trays'],[' // Bedroom\'s fixed feature wall',' // Bathroom tile envelope'],[' // Bathroom tile envelope',' basin();toilet();shower();']])assert.equal(part(current,a,b),part(old,a,b),'Surrounding fixtures/envelope changed');
const aim=(name,x,z,eye,target,fov,w,h)=>({name,x,z,eye,yaw:Math.atan2(target[0]-x,-(target[2]-z)),pitch:Math.atan2(target[1]-eye,Math.hypot(target[0]-x,target[2]-z)),fov,w,h,inspection:true});
const views=[aim('niche-close-up',5.68,5.48,1.55,[6.03,1.48,6.20],62,1200,1400),aim('niche-oblique',5.92,5.85,1.52,[6.112,1.19,6.20],46,1200,1200)];
(async()=>{fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage({viewport:{width:800,height:600}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.HOUSEWALK_URL||'http://127.0.0.1:8000/v4/');await page.waitForFunction(()=>window.__HW4_ASSETS&&window.__HW4_MATERIALS,{},{timeout:120000});await page.addStyleTag({content:'.ui,.tint{display:none!important}'});
const geometry=await page.evaluate(async()=>{
 const T=await import('/v4/vendor/three.module.min.js'),S=HWScene;S.scene.updateMatrixWorld(true);
 const ray=(p,d)=>{const h=new T.Raycaster(new T.Vector3(...p),new T.Vector3(...d),.0001,2).intersectObjects(S.scene.children,true).find(h=>!h.object.material?.transparent);if(!h)throw Error('Inspection ray missed');return h.point.toArray()};
 const front=ray([6.112,1.43,5.9],[0,0,1]),back=ray([6.112,1.30,5.9],[0,0,1]);
 const left=ray([6.112,1.30,6.18],[-1,0,0]),right=ray([6.112,1.30,6.18],[1,0,0]);
 const bottom=ray([6.198,1.24,6.20],[0,-1,0]),top=ray([6.198,1.24,6.20],[0,1,0]);
 const heater=new T.Box3().setFromObject(S.rooms.named['Bathroom black water heater']);
 const partition=new T.Box3();for(const name of ['Bathroom partition below niche','Bathroom partition above niche','Bathroom niche left masonry pier','Bathroom niche right masonry pier','Bathroom niche recessed back'])partition.union(new T.Box3().setFromObject(S.rooms.named[name]));
 const c=new T.PerspectiveCamera(82,768/1024,.06,80);c.position.set(5.30,1.50,5.10);c.rotation.set(-.14,-2.70,0,'YXZ');c.updateMatrixWorld(true);
 const pixel=p=>{const v=new T.Vector3(...p).project(c);return [(v.x+1)*384,(1-v.y)*512]};
 const products=[[6.173,1.18,6.132],[6.116,1.18,6.132],[6.059,1.18,6.120]].map((p,i)=>{const target=new T.Vector3(...p),dir=target.clone().sub(c.position).normalize(),h=new T.Raycaster(c.position,dir,.001,2).intersectObjects(S.scene.children,true).find(h=>!h.object.material?.transparent);return {name:i<2?'navy pump '+(i+1):'white/blue tube',screen:pixel(p),firstHit:h?.point.toArray(),material:h?.object.material.name,visible:!!h&&h.point.distanceTo(target)<.045};});
 return {normal:[0,0,-1],front,back,left,right,bottom,top,width:right[0]-left[0],height:top[1]-bottom[1],depth:back[2]-front[2],openingCenter:[(right[0]+left[0])/2,(top[1]+bottom[1])/2,front[2]],heaterBounds:[heater.min.toArray(),heater.max.toArray()],heaterBottomGap:heater.min.y-top[1],outerPartitionEnvelope:[partition.min.x,partition.max.x,partition.min.y,partition.max.y,partition.min.z,partition.max.z],approvedShowerPixels:{opening:[[left[0],top[1],front[2]],[right[0],top[1],front[2]],[right[0],bottom[1],front[2]],[left[0],bottom[1],front[2]]].map(pixel),products},fixturesUnchangedFromReviewedHead:true,walkthroughCameraScriptUnchanged:true};
});
assert(Math.abs(geometry.width-.188)<.002);assert(Math.abs(geometry.height-.32)<.002);assert(Math.abs(geometry.depth-.15)<.002);assert(geometry.heaterBottomGap>.095&&geometry.heaterBottomGap<.105);
assert(geometry.approvedShowerPixels.products.every(p=>p.visible),'Products occluded from unchanged shower camera');assert(geometry.approvedShowerPixels.products[0].screen[0]<geometry.approvedShowerPixels.products[1].screen[0]&&geometry.approvedShowerPixels.products[1].screen[0]<geometry.approvedShowerPixels.products[2].screen[0],'Reference product order reversed');
assert(geometry.outerPartitionEnvelope.every((v,i)=>Math.abs(v-[6,6.30,0,2.77,6.10,6.38][i])<.00001),'Partition outer envelope moved');
for(const v of views){await page.setViewportSize({width:v.w,height:v.h});await page.evaluate(v=>{HousewalkBridge.doors[1].open=true;Object.assign(HousewalkBridge.player,v);Object.assign(HousewalkBridge.camera,{eyeHeight:v.eye,verticalFov:v.fov})},v);const f=await page.evaluate(()=>__HW4_FRAME);await page.waitForFunction(f=>__HW4_FRAME>=f+3,f,{timeout:120000});await page.screenshot({path:path.join(output,'desktop-'+v.name+'.png'),timeout:120000});console.log('Captured '+v.name);}
assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'niche-geometry.json'),JSON.stringify({reviewedBase:base,result:'PASS geometry/freeze; visual review separate',geometry,inspectionCameras:views,errors},null,2));console.log(JSON.stringify(geometry));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
