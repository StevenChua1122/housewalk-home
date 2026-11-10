// Private visual review only. Never write source references or composites into git.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const refs=process.env.HW_REFERENCE_DIR,output=process.env.HW_COMPARISON_DIR;
if(!refs||!output)throw Error('Set HW_REFERENCE_DIR and HW_COMPARISON_DIR outside the repository.');
const repo=path.resolve(__dirname,'../..');if(path.resolve(output).startsWith(repo+path.sep)||path.resolve(output)===repo)throw Error('Private comparison output must be outside the repository.');
const data=(file)=>`data:image/${/jpe?g$/i.test(file)?'jpeg':'png'};base64,${fs.readFileSync(file).toString('base64')}`;
const entries=[
 ['01-living','01_FINAL_LIVING_DINING.png','desktop-01-living-dining.png','Living / dining — entire approved image and entire in-game capture'],
 ['02-oak','01_FINAL_LIVING_DINING.png','desktop-02-oak-floor.png','Oak material — approved wide view and actual close inspection camera'],
 ['03-curtains','01_FINAL_LIVING_DINING.png','desktop-03-curtain-window.png','Drapery / window — approved wide view and actual close inspection camera'],
 ['04-kitchen','02_FINAL_KITCHEN.png','desktop-04-kitchen-first.png','Kitchen — continuous white upper run including the washing-machine end'],
 ['05-kitchen-second','02_FINAL_KITCHEN.png','desktop-05-kitchen-second.png','Same connected kitchen from a second angle — final pack contains one kitchen viewpoint'],
 ['06-entrance','03_FINAL_ENTRANCE.png','desktop-06-entrance.png','Entrance — two separate six-level racks; long axis perpendicular to door plane'],
 ['07-window-construction','05_REAL_LIVING_WINDOW.jpg','desktop-03-curtain-window.png','Private real window photo versus actual 3D frame / handles / fixed lower panes']
];
(async()=>{fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true});
try{const page=await browser.newPage({viewport:{width:1800,height:1250},deviceScaleFactor:1});let index=[];
for(const [name,reference,actual,title]of entries){const html=`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#f7f4ee;color:#263c35;font:16px Arial}main{padding:22px}h1{font-size:23px;margin:0 0 10px}.notes{color:#5b625c;margin:0 0 17px;font-size:14px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}figure{margin:0;background:#e8e4db}figcaption{padding:12px;font-weight:bold;background:white}img{display:block;width:100%;height:620px;object-fit:contain}footer{padding-top:16px;color:#5b625c;font-size:14px}</style><main><h1>${title}</h1><p class="notes">Private reference comparison • full frames scaled to fit • no furniture hidden or relocated for capture • lenses are estimates</p><div class="pair"><figure><figcaption>Approved / authoritative reference — ${reference}</figcaption><img src="${data(path.join(refs,reference))}"></figure><figure><figcaption>Actual interactive PBR scene — ${actual}</figcaption><img src="${data(path.join(repo,'v4/qa/final',actual))}"></figure></div><footer>Real-time approximation: indirect light, exterior detail and cloth differ from the offline mockup. Physical iPhone Safari performance unverified.</footer></main>`;
fs.writeFileSync(path.join(output,name+'.html'),html);await page.setContent(html);await page.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode())));await page.locator('main').screenshot({path:path.join(output,name+'.png')});index.push(`<li><a href="${name}.html">${title}</a> · <a href="${name}.png">comparison PNG</a></li>`);}
fs.writeFileSync(path.join(output,'index.html'),'<meta charset="utf-8"><title>Housewalk private comparison review</title><h1>Final-reference comparison sheets</h1><p>Private review artifacts — do not commit or publish.</p><ul>'+index.join('')+'</ul>');console.log('Wrote '+entries.length+' private comparison sheets to '+output);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
