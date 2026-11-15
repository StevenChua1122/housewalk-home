const {chromium}=require('playwright'),path=require('node:path');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true});
try{for(const [name,width,height]of [['clearance-measurement',1400,970],['mop-clearance',1300,690]]){
 const page=await browser.newPage({viewport:{width,height}}),url=new URL(`qa/owner-final/${name}.svg`,process.env.HOUSEWALK_URL||'http://127.0.0.1:8000/v4/');
 await page.goto(url.href);await page.screenshot({path:path.resolve(__dirname,`../qa/owner-final/${name}.png`)});await page.close();console.log(`Rendered ${name}.png`);
}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
