"""Actual exported loose footwear versus the unchanged original door's full sweep."""
import bpy,math,json,os,numpy as np
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
root=Path(__file__).resolve().parents[1]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(root/'assets/models/final-room-props.glb'))
vv=[];ff=[]
for o in bpy.context.scene.objects:
 if o.type!='MESH' or not o.parent or not o.parent.name.replace('_',' ').startswith('Bathroom approved accessories'):continue
 if not any('black rubber' in m.name or 'satin black enamel' in m.name for m in o.data.materials):continue
 o.data.calc_loop_triangles();world=[o.matrix_world@v.co for v in o.data.vertices]
 for t in o.data.loop_triangles:
  tri=[world[i] for i in t.vertices]
  if not all(5.3<p.x<5.85 and .01<p.z<.1 and 4.46<-p.y<4.8 for p in tri):continue
  b=len(vv);vv.extend([Vector((p.x,p.z,-p.y)) for p in tri]);ff.append((b,b+1,b+2))
assert vv,'Actual slipper geometry missing'
a=np.array(vv);shoe=BVHTree.FromPolygons(vv,ff,all_triangles=True)
faces=[(0,1,3),(0,3,2),(4,6,7),(4,7,5),(0,4,5),(0,5,1),(2,3,7),(2,7,6),(0,2,6),(0,6,4),(1,5,7),(1,7,3)]
states=[]
for theta in np.linspace(-math.pi/2,-.34,241):
 c,s=math.cos(theta),math.sin(theta);d=a-[4.95,0,4.49];xx=c*d[:,0]-s*d[:,2];zz=s*d[:,0]+c*d[:,2]
 inside=int(((xx>0)&(xx<.78)&(abs(zz)<.0325)&(a[:,1]>.025)&(a[:,1]<2.175)).sum())
 corners=[Vector((4.95+c*x+s*z,y,4.49-s*x+c*z)) for x in [0,.78] for y in [.025,2.175] for z in [-.0325,.0325]]
 leaf=BVHTree.FromPolygons(corners,faces,all_triangles=True)
 states.append({'doorRotationRadians':float(theta),'verticesInsideLeaf':inside,'crossingTrianglePairs':len(shoe.overlap(leaf))})
j={'result':'PASS' if not any(s['verticesInsideLeaf'] or s['crossingTrianglePairs'] for s in states) else 'FAIL','actualExportedTriangles':len(ff),'door':'Original 0.780 × 2.150 × 0.065 m leaf; pivot (4.95,0,4.49), bottom Y 0.025 m, approved 70.519° stop. No door/mop/fixture changes.','looseFootwearOnly':{'previousCenters':[[5.47,4.72],[5.57,4.76]],'refinedCenters':[[5.64,4.52],[5.63,4.62]],'orientationRadians':[1.54,1.62],'reason':'Adult-size slippers align along the white wall and clear the fixed leaf instead of entering its sweep.'},'minimumWhiteWallClearanceMetres':float(a[:,2].min()-4.461),'bounds':[a.min(0).tolist(),a.max(0).tolist()],'states':states,'limit':'Actual triangle/inside tests at 241 poses, not an analytic continuous-time guarantee.'}
out=Path(os.environ.get('HW_PROOF_DIR',str(root/'qa/mockup-round4')));out.mkdir(parents=True,exist_ok=True);(out/'footwear-contact-proof.json').write_text(json.dumps(j,indent=2))
print('FOOTWEAR_CONTACT',j['result'],len(ff),'triangles, max crossings',max(s['crossingTrianglePairs'] for s in states),flush=True)
assert j['result']=='PASS'
