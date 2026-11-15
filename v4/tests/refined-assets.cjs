/* Validate replacement exports and the hard freeze independently of the authoring scripts. */
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const base='563ad42dfe3fc78a98f1926ebf743f706bc5d26d';
const frozen=['v4/layout.js','v4/window-alcove.js','v4/bedroom-rug.js','v4/assets/models/bedroom-soft.glb','v4/assets/models/bathroom-door-mop.glb','v4/tests/capture-owner-final.cjs'];
for(const p of frozen)assert(fs.readFileSync(p).equals(cp.execFileSync('git',['show',`${base}:${p}`],{maxBuffer:16*1024*1024})),`Frozen file changed: ${p}`);
const segment=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b));
for(const [p,a,b]of [['v4/room-details.js'," // Bedroom's fixed feature wall",' // Bathroom tile envelope'],['v4/webgl.js',' // Source-plan shell',' // Detail mesh'],['v4/webgl.js',' // Entrance construction',' const glass=alcove.glass'],['v4/webgl.js',' // Door transforms',' const roomShadowLights']])assert.equal(segment(fs.readFileSync(p,'utf8'),a,b),segment(cp.execFileSync('git',['show',`${base}:${p}`],{encoding:'utf8'}),a,b),`Frozen construction changed: ${p}`);
const identity=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
const multiply=(a,b)=>Array.from({length:16},(_,i)=>{const r=i%4,c=Math.floor(i/4);return [0,1,2,3].reduce((v,k)=>v+a[k*4+r]*b[c*4+k],0)});
function local(n){if(n.matrix)return n.matrix;const [x,y,z,w]=n.rotation||[0,0,0,1],[a,b,c]=n.scale||[1,1,1],t=n.translation||[0,0,0];return [(1-2*(y*y+z*z))*a,2*(x*y+z*w)*a,2*(x*z-y*w)*a,0,2*(x*y-z*w)*b,(1-2*(x*x+z*z))*b,2*(y*z+x*w)*b,0,2*(x*z+y*w)*c,2*(y*z-x*w)*c,(1-2*(x*x+y*y))*c,0,...t,1]}
function scopedBounds(j,prefix,binary){
 const result={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
 function visit(index,parent,inside){const n=j.nodes[index],m=multiply(parent,local(n));inside=inside||(n.name||'').startsWith(prefix);
  if(inside&&n.mesh!==undefined)for(const prim of j.meshes[n.mesh].primitives){const a=j.accessors[prim.attributes.POSITION],v=j.bufferViews[a.bufferView],off=(v.byteOffset||0)+(a.byteOffset||0),stride=v.byteStride||12;assert.equal(a.componentType,5126);for(let i=0;i<a.count;i++){const xyz=[0,1,2].map(k=>binary.readFloatLE(off+i*stride+k*4));for(let k=0;k<3;k++){const value=m[k]*xyz[0]+m[4+k]*xyz[1]+m[8+k]*xyz[2]+m[12+k];result.min[k]=Math.min(result.min[k],value);result.max[k]=Math.max(result.max[k],value);}}}

  for(const c of n.children||[])visit(c,m,inside);
 }for(const n of j.scenes[j.scene||0].nodes)visit(n,identity(),false);return result;
}
const assets=[];let accessoryBounds;
for(const file of ['sofa-refined.glb','curtains-refined.glb','kitchen-refined.glb','hallway-refined.glb','final-room-props.glb']){
 const p='v4/assets/models/'+file,data=fs.readFileSync(p),j=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)));assert.equal(data.readUInt32LE(0),0x46546c67);assert.equal(data.readUInt32LE(8),data.length);
 let triangles=0,vertices=0,contacts=0;
 for(const mesh of j.meshes)for(const prim of mesh.primitives){
  assert(prim.attributes.NORMAL!==undefined,'Missing smooth/manufactured normals');assert(prim.attributes.COLOR_0!==undefined,'Missing geometry contact field');
  const a=j.accessors[prim.attributes.POSITION];assert(a.min.every(Number.isFinite)&&a.max.every(Number.isFinite));vertices+=a.count;triangles+=j.accessors[prim.indices].count/3;
  const c=j.accessors[prim.attributes.COLOR_0];assert.equal(c.count,a.count);contacts+=c.count;
 }
 assert(triangles<350000&&triangles>1000,`Unexpected asset size: ${file}`);
 assert(!(j.images||[]).some(i=>i.uri),'No external image dependency allowed');
 if(file==='final-room-props.glb'){
  accessoryBounds={broom:scopedBounds(j,'Hallway broom and red dustpan',data.subarray(28+data.readUInt32LE(12))),plush:scopedBounds(j,'Hallway visible sofa plush',data.subarray(28+data.readUInt32LE(12))),console:scopedBounds(j,'Hallway visible console and trolley details',data.subarray(28+data.readUInt32LE(12)))};
  // This detects the visually discovered origin error: rotated ears/petals must
  // stay on their individual toys rather than orbiting the apartment origin.
  assert(accessoryBounds.broom.max[0]>3.073&&accessoryBounds.broom.max[0]<3.0752,'Broom tip must naturally contact fixed wall face x=3.075');
  const b=accessoryBounds.plush;assert(b.min[0]>-.01&&b.max[0]<1.0&&b.min[1]>.40&&b.max[1]<1.60&&b.min[2]>.85&&b.max[2]<3.10,JSON.stringify(b));
  const c=accessoryBounds.console;assert(c.min[0]>2.40&&c.max[0]<3.10&&c.min[1]>.10&&c.max[1]<2.40&&c.min[2]>.45&&c.max[2]<3.80,JSON.stringify(c));
  const acrylic=j.materials.find(m=>m.name.includes('Refined clear acrylic'));assert.equal(acrylic.alphaMode,'BLEND');assert(acrylic.pbrMetallicRoughness.baseColorFactor[3]<.2);assert.equal(j.images.length,1);assert(j.materials.some(m=>m.name==='IMG_9974 isolated mug artwork'));}
 else assert.equal((j.images||[]).length,0,'Room reference pixels must never be embedded');
 assets.push({file,bytes:data.length,vertices,triangles,contacts,sha256:crypto.createHash('sha256').update(data).digest('hex')});
}
assert(assets.reduce((n,a)=>n+a.triangles,0)<600000,'Total refined mesh budget exceeded');
const output=process.env.HW_PROOF_DIR||'v4/qa/visual-refinement';fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(output+'/asset-proof.json',JSON.stringify({base,frozen:'PASS',frozenFiles:frozen,architecture:'PASS',accessoryBounds,assets},null,2));console.log(JSON.stringify({frozen:'PASS',assets}));
