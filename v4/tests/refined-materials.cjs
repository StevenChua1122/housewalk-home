/* A fixture arriving after the theme changes must inherit the selected state. */
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const T=await import('../vendor/three.module.min.js'),{refinedMaterials}=await import('../refined-materials.js');
 const f=refinedMaterials(()=>new T.Texture()),fixture=()=>f.material(new T.MeshStandardMaterial({name:'Refined warm fixture lens'}));
 const initialDay=fixture();assert.equal(initialDay.emissiveIntensity,.75);
 f.updateNight(true);const lateNight=fixture();assert.equal(initialDay.emissiveIntensity,1.15);assert.equal(lateNight.emissiveIntensity,1.15);
 f.updateNight(false);const lateDay=fixture();assert.equal(lateNight.emissiveIntensity,.75);assert.equal(lateDay.emissiveIntensity,.75);
 const result={result:'PASS',cases:['initial day','night selected before asynchronous fixture creation','existing fixtures follow night/day','late day fixture inherits day'],dayEmission:.75,nightEmission:1.15};
 const out=process.env.HW_PROOF_DIR||'v4/qa/visual-refinement';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/material-state-proof.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exit(1)});
