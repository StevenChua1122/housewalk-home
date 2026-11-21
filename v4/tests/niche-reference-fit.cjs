/* Quantify the image-alignment constraint without moving any scene or camera. */
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const T=await import('../vendor/three.module.min.js'),out=process.env.HW_PROOF_DIR||'v4/qa/niche-round3';
const proof=JSON.parse(fs.readFileSync(out+'/niche-geometry.json')),views=JSON.parse(fs.readFileSync(out+'/cameras.json')).views,v=views.find(v=>v.name==='bathroom-shower');
const c=new T.PerspectiveCamera(v.fov,v.w/v.h,.06,80);c.position.set(v.x,v.eye,v.z);c.rotation.set(v.pitch,-v.yaw,0,'YXZ');c.updateMatrixWorld(true);
// Manual image estimate from the exact locked 04 RIGHT half. This is not a
// surveyed physical measurement or a claim that the image is camera-calibrated.
const referenceCenter=[372,489],p=new T.Vector3(referenceCenter[0]/v.w*2-1,1-referenceCenter[1]/v.h*2,.5).unproject(c),d=p.sub(c.position).normalize(),g=proof.geometry;
const required=c.position.clone().addScaledVector(d,(g.front[2]-c.position.z)/d.z),returnX=[g.outerPartitionEnvelope[0],6.208];
const outside=required.x<returnX[0]||required.x>returnX[1];assert(outside,'Reassess whether the image conflict still exists');
const result={result:'PARTIAL visual alignment; geometric conflict documented',reference:'04_FINAL_BATHROOM_TWO_VIEWS_LOCKED.png RIGHT half',referencePixelCenterApproximate:referenceCenter,referencePixelEstimateTolerance:5,camera:v,measuredOpeningPixels:g.approvedShowerPixels.opening,existingReturnXMetres:returnX,existingReturnFrontZMetres:g.front[2],referenceCenterRayOnThatPlaneMetres:required.toArray(),outsideExistingPartitionReturn:outside,note:'Under the unchanged reviewed camera, the mockup opening center maps outside the locked return. Moving the opening there would leave the existing partition. This is a constraint demonstration, not a proposal to change architecture or a survey of the photograph.'};
fs.writeFileSync(out+'/niche-reference-fit.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exit(1)});
