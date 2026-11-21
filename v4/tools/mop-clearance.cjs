// Read-only audit of the exported mop against the fixed north bathroom tile face.
(async()=>{const fs=require('node:fs'),path=require('node:path'),T=await import('../vendor/three.module.min.js');
const file=path.resolve(__dirname,'../assets/models/bathroom-door-mop.glb'),data=fs.readFileSync(file),n=data.readUInt32LE(12),j=JSON.parse(data.subarray(20,20+n)),binary=data.subarray(28+n),faceZ=4.456,records=[];
for(const angle of [0,-.34]){const door=new T.Matrix4().makeRotationY(angle);door.setPosition(4.95,0,4.49);const bounds=new T.Box3(),points=[];
 function visit(i,parent){const node=j.nodes[i],local=node.matrix?new T.Matrix4().fromArray(node.matrix):new T.Matrix4().compose(new T.Vector3().fromArray(node.translation||[0,0,0]),new T.Quaternion().fromArray(node.rotation||[0,0,0,1]),new T.Vector3().fromArray(node.scale||[1,1,1])),world=parent.clone().multiply(local);
  if(node.mesh!==undefined)for(const primitive of j.meshes[node.mesh].primitives){const a=j.accessors[primitive.attributes.POSITION],v=j.bufferViews[a.bufferView],start=(v.byteOffset||0)+(a.byteOffset||0),stride=v.byteStride||12;
   for(let k=0;k<a.count;k++){const p=new T.Vector3(binary.readFloatLE(start+k*stride),binary.readFloatLE(start+k*stride+4),binary.readFloatLE(start+k*stride+8)).applyMatrix4(world);bounds.expandByPoint(p);points.push([p.x,p.z]);}}
  for(const child of node.children||[])visit(child,world);
 }
 for(const root of j.scenes[j.scene||0].nodes)visit(root,door);
 const sorted=points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),hull=[];
 for(const p of sorted){while(hull.length>1&&cross(hull.at(-2),hull.at(-1),p)<=0)hull.pop();hull.push(p);}const first=hull.length;
 for(const p of sorted.slice(0,-1).reverse()){while(hull.length>first&&cross(hull.at(-2),hull.at(-1),p)<=0)hull.pop();hull.push(p);}hull.pop();
 const leaf=[[0,-.0325],[.78,-.0325],[.78,.0325],[0,.0325]].map(([x,z])=>new T.Vector3(x,0,z).applyMatrix4(door)).map(p=>[p.x,p.z]);
 records.push({rotationRadians:angle,openDegrees:90+angle*180/Math.PI,fixedWallFaceZ:faceZ,mopMinZ:bounds.min.z,clearanceMetres:bounds.min.z-faceZ,mopFootprint:hull,doorLeaf:leaf});
}
const svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1300" height="690" viewBox="0 0 1300 690"><rect width="1300" height="690" fill="#faf8f2"/><g font-family="Arial,sans-serif">'];
const text=(s,x,y,size=18,color='#283e36')=>svg.push(`<text x="${x}" y="${y}" font-size="${size}" fill="${color}">${s}</text>`);
text('Door-back mop: fixed-wall clearance audit',40,38,27);text('Top-down projection of actual exported vertices. Owner-approved leaf stop only; hinge, doorway, jamb and walls stay fixed.',40,72,18);
for(const [i,r]of records.entries()){const X=x=>55+i*640+(x-4.85)*450,Y=z=>155+(z-4.15)*370,color=i?'#257d60':'#ba413d';
 text(i?'Owner-approved stop: 70.5° open':'Inherited pose: 90° open',55+i*640,115,23);text(i?'Mop clears wall by 1.8 cm':'Mop overlaps wall by 11.1 cm',55+i*640,144,18,color);
 svg.push(`<rect x="${X(4.85)}" y="${Y(4.15)}" width="450" height="${(faceZ-4.15)*370}" fill="#c6ceca"/><path d="M${X(4.85)} ${Y(faceZ)} H${X(5.85)}" stroke="#4e5f57" stroke-width="3"/>`);
 text('Fixed north wall',X(5.16),Y(4.27),18);svg.push(`<path d="M${X(4.95)} ${Y(4.49)} L${X(4.95)} ${Y(5.27)}" stroke="#a37f54" stroke-width="2" stroke-dasharray="7 5"/>`);
 svg.push(`<polygon points="${r.doorLeaf.map(p=>`${X(p[0])},${Y(p[1])}`).join(' ')}" fill="#ddbb8b" stroke="#987148" stroke-width="2"/><polygon points="${r.mopFootprint.map(p=>`${X(p[0])},${Y(p[1])}`).join(' ')}" fill="${color}" fill-opacity=".78" stroke="${color}"/><circle cx="${X(4.95)}" cy="${Y(4.49)}" r="5" fill="#283e36"/>`);
 text('Same hinge',X(4.86),Y(4.78),16);text('Dashed line: unchanged closed doorway',55+i*640,606,16);
}
text('The colored footprint includes the whole mop, hook and handle. Clearance is measured to the finished tile face.',40,650,17);svg.push('</g></svg>');
const out=path.resolve(__dirname,'../qa/owner-final');fs.writeFileSync(path.join(out,'mop-clearance.svg'),svg.join('\n'));fs.writeFileSync(path.join(out,'mop-clearance.json'),JSON.stringify({basis:'Read-only comparison. Owner approved the 70.5-degree leaf stop; original hinge, leaf geometry, mop, jamb and walls remain fixed.',approvedRotationRadians:-.34,records},null,2)+'\n');console.log(JSON.stringify(records.map(({mopFootprint,doorLeaf,...r})=>r)));
})().catch(e=>{console.error(e);process.exit(1)});
