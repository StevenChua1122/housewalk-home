// Private reference comparisons. No home image or composite may be written in git.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const refs=process.env.HW_REFERENCE_DIR,output=process.env.HW_COMPARISON_DIR;
const repo=path.resolve(__dirname,'../..'),shots=path.join(repo,'v4/qa/integrated-v3');
if(!refs||!output)throw Error('Set HW_REFERENCE_DIR and HW_COMPARISON_DIR.');
if(path.resolve(output).startsWith(repo+path.sep)||path.resolve(output)===repo)throw Error('Private comparisons must be outside the repository.');
const data=file=>`data:image/${/jpe?g$/i.test(file)?'jpeg':'png'};base64,${fs.readFileSync(file).toString('base64')}`;
const entries=[
 ['01-living','01_FINAL_LIVING_DINING.png',['01-living-dining'],'Living / dining — locked arrangement'],
 ['02-oak','01_FINAL_LIVING_DINING.png',['02-oak-floor'],'Oak — approved wide view and actual close inspection'],
 ['03-curtains','01_FINAL_LIVING_DINING.png',['03-living-window'],'Living drapery / real recessed window'],
 ['04-kitchen','02_FINAL_KITCHEN.png',['04-kitchen'],'Kitchen — retained full white upper-cabinet run'],
 ['05-entrance','03_FINAL_ENTRANCE.png',['05-entrance'],'Entrance — two perpendicular six-level racks'],
 ['06-bedroom','08_FINAL_BEDROOM_VIEW_FROM_DOOR.png',['06-bedroom-main'],'Latest bedroom design — one cabinet under AC, two-head standing lamp'],
 ['07-bedroom-reverse','09_FINAL_BEDROOM_REVERSE_VIEW.png',['07-bedroom-reverse'],'Reverse bedroom — latest 08 cabinet rule overrides the older position in 09'],
 ['08-cabinet-proof','12_REAL_BEDSIDE_CABINET.jpg',['08-bedside-top','08b-bedside-side'],'Cabinet style and physical corner placement — top / side proof cameras'],
 ['09-hallway','16_REAL_HALLWAY_FROM_LIVING_TO_BED_BATH.jpg',['09-hallway'],'Actual hallway architecture — secondary guide 15 does not govern the layout'],
 ['10-bathroom','17_FINAL_BATHROOM_TWO_VIEWS.png',['10-bathroom-first','11-bathroom-shower'],'Bathroom — two approved views and two actual views of the same 3D room']
];
(async()=>{fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true});
try{const p=await browser.newPage({viewport:{width:1800,height:1300},deviceScaleFactor:1});let links=[];
for(const [name,ref,views,title]of entries){const actual=views.map(v=>`<img src="${data(path.join(shots,'desktop-'+v+'.png'))}">`).join('');
 const html=`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#f7f4ee;color:#263c35;font:16px Arial}main{padding:22px}h1{font-size:22px;margin:0 0 10px}.note{font-size:14px;color:#5b625c}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}figure{margin:0;background:#e8e4db}figcaption{padding:12px;font-weight:bold;background:white}.images{height:660px;display:flex;align-items:center}img{display:block;width:100%;height:660px;object-fit:contain}.images img{width:${100/views.length}%}footer{padding-top:14px;font-size:14px;color:#5b625c}</style><main><h1>${title}</h1><p class="note">Private visual review • full frames scaled to fit • no objects hidden • furniture and lenses are identified estimates</p><div class="pair"><figure><figcaption>Reference — ${ref}</figcaption><img src="${data(path.join(refs,ref))}"></figure><figure><figcaption>Actual WebGL — ${views.join(' / ')}</figcaption><div class="images">${actual}</div></figure></div><footer>Differences remain in indirect light, cloth folds, grain and fixture detail. Physical iPhone Safari performance unverified. Source references are not in the public repository.</footer></main>`;
 fs.writeFileSync(path.join(output,name+'.html'),html);await p.setContent(html);await p.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode())));await p.locator('main').screenshot({path:path.join(output,name+'.png')});links.push(`<li><a href="${name}.html">${title}</a> · <a href="${name}.png">PNG</a></li>`);
}fs.writeFileSync(path.join(output,'index.html'),'<meta charset="utf-8"><title>Housewalk v3 private comparisons</title><h1>Private integrated reference review</h1><ul>'+links.join('')+'</ul>');console.log('Created '+entries.length+' private comparison sheets.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
