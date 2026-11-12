// Private reference comparisons. No home image or composite may be written in git.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const refs=process.env.HW_REFERENCE_DIR,output=process.env.HW_COMPARISON_DIR;
const repo=path.resolve(__dirname,'../..'),shots=path.join(repo,'v4/qa/v5-sunlit');
if(!refs||!output)throw Error('Set HW_REFERENCE_DIR and HW_COMPARISON_DIR.');
if(path.resolve(output).startsWith(repo+path.sep)||path.resolve(output)===repo)throw Error('Private comparisons must be outside the repository.');
const data=file=>`data:image/${/jpe?g$/i.test(file)?'jpeg':'png'};base64,${fs.readFileSync(file).toString('base64')}`;
const entries=[
 ['01-living','approved_references/01_FINAL_SUNLIT_LIVING_DINING.jpg',['01-living-dining'],'Latest approved V5 sunny living / dining — furniture positions retained'],
 ['02-alcove','real_photos/22_REAL_LIVING_WINDOW_RECESS_AND_CEILING.jpg',['01a-alcove-close','01b-alcove-top'],'Alcove architecture — real photo / close view / top-down geometry'],
 ['03-oak','approved_references/01_FINAL_SUNLIT_LIVING_DINING.jpg',['02-oak-floor'],'Oak material and natural sunlight — full reference / actual close-up'],
 ['04-curtains','approved_references/01_FINAL_SUNLIT_LIVING_DINING.jpg',['03-living-window'],'Open taupe drapery / corrected framed window'],
 ['05-bedroom','approved_references/02_FINAL_SUNLIT_BEDROOM.jpg',['04-bedroom-main'],'Latest sunny bedroom — same furniture, no visible runner from main camera'],
 ['06-reverse','approved_references/07_BEDROOM_REVERSE_VIEW_LAYOUT_ONLY.jpg',['05-bedroom-reverse'],'Reverse guide controls layout only; sunny materials take priority'],
 ['07-ac','real_photos/13_REAL_BEDROOM_FROM_DOOR.jpg',['06-bedroom-ac'],'Bedroom AC — oblique mounting-plane clearance proof'],
 ['08-rug-cabinet','real_photos/21_REAL_BEDROOM_CAT_RUG_TOP_DOWN_POSITION.jpg',['07-bedroom-rug-top','08-bedside-side'],'Real north bed aisle / actual cat runner and corner cabinet proof'],
 ['09-kitchen','approved_references/04_FINAL_KITCHEN.jpg',['09-kitchen'],'Preserved kitchen — continuous white upper run'],
 ['10-entrance','approved_references/05_FINAL_ENTRANCE.jpg',['10-entrance'],'Preserved entrance — two perpendicular six-level racks'],
 ['11-hallway','real_photos/18_REAL_HALLWAY_FROM_LIVING_TO_BED_BATH.jpg',['11-hallway'],'Actual hallway openings / same connected apartment'],
 ['12-bathroom','approved_references/09_FINAL_BATHROOM_TWO_VIEWS.jpg',['12-bathroom-first','14-bathroom-shower'],'Bathroom — two actual views, plain mirror and no glass enclosure'],
 ['13-toilet','real_photos/20_REAL_BATHROOM_VIEW_2.jpg',['13-toilet-close'],'Remodelled close-coupled toilet — separate bowl, seat, lid, cistern and pedestal']
];
(async()=>{fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true});
try{const p=await browser.newPage({viewport:{width:1800,height:1300},deviceScaleFactor:1});let links=[];
for(const [name,ref,views,title]of entries){const actual=views.map(v=>`<img src="${data(path.join(shots,'desktop-'+v+'.png'))}">`).join('');
 const html=`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#f7f4ee;color:#263c35;font:16px Arial}main{padding:22px}h1{font-size:22px;margin:0 0 10px}.note{font-size:14px;color:#5b625c}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}figure{margin:0;background:#e8e4db}figcaption{padding:12px;font-weight:bold;background:white}.images{height:660px;display:flex;align-items:center}img{display:block;width:100%;height:660px;object-fit:contain}.images img{width:${100/views.length}%}footer{padding-top:14px;font-size:14px;color:#5b625c}</style><main><h1>${title}</h1><p class="note">Private visual review • full frames scaled to fit • no objects hidden • furniture and lenses are identified estimates</p><div class="pair"><figure><figcaption>Reference — ${ref}</figcaption><img src="${data(path.join(refs,ref))}"></figure><figure><figcaption>Actual WebGL — ${views.join(' / ')}</figcaption><div class="images">${actual}</div></figure></div><footer>Differences remain in indirect light, cloth folds, grain and fixture detail. Physical iPhone Safari performance unverified. Source references are not in the public repository.</footer></main>`;
 fs.writeFileSync(path.join(output,name+'.html'),html);await p.setContent(html);await p.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode())));await p.locator('main').screenshot({path:path.join(output,name+'.png')});links.push(`<li><a href="${name}.html">${title}</a> · <a href="${name}.png">PNG</a></li>`);
}fs.writeFileSync(path.join(output,'index.html'),'<meta charset="utf-8"><title>Housewalk V5 private comparisons</title><h1>Private V5 sunny reference review</h1><ul>'+links.join('')+'</ul>');console.log('Created '+entries.length+' private comparison sheets.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
