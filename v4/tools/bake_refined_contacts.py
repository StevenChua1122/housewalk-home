"""Bake compact geometry-only ambient contact shading into refined local GLBs.

Runs after all three authoring scripts. 32 deterministic hemisphere rays sample
real neighboring surfaces in the common metre coordinate system. No lighting,
reference imagery, camera, door state, architecture or collision data is exported.
The immutable bedroom and door/mop assets are never imported or written.
"""
import bpy,math,time,os
from pathlib import Path
from mathutils import Vector,Matrix
from mathutils.bvhtree import BVHTree
out=Path(__file__).resolve().parents[1]/'assets/models'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
files=['kitchen-refined.glb','hallway-refined.glb','sofa-refined.glb','curtains-refined.glb','final-room-props.glb']
assets=[]
for file in files:
 before=set(bpy.context.scene.objects);bpy.ops.import_scene.gltf(filepath=str(out/file));objects=list(set(bpy.context.scene.objects)-before)
 root=bpy.data.objects.new('Contact bake placement '+file,None);bpy.context.collection.objects.link(root)
 for o in objects:
  if o.parent is None:o.parent=root
 if file=='sofa-refined.glb':root.scale=(.94,.90,1);root.location.y=-.12
 if file=='curtains-refined.glb':root.scale.x=.944;root.location=(.115,.66,0)
 assets.append((file,objects,root))
bpy.context.view_layer.update()
verts=[];faces=[]
for o in bpy.context.scene.objects:
 if o.type!='MESH':continue
 if o.data.materials and all(m.node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value<.5 for m in o.data.materials if m and m.use_nodes):continue
 me=o.data;me.calc_loop_triangles();offset=len(verts);verts.extend([tuple(o.matrix_world@v.co) for v in me.vertices]);faces.extend([tuple(offset+i for i in t.vertices) for t in me.loop_triangles])
def proxy(x,y,z,w,h,d):
 # World Y-up input, Blender Z-up BVH only. These are exact retained supporting
 # surfaces, not new exported geometry or substitutes for the runtime shell.
 off=len(verts)
 verts.extend([(x+sx*w/2,-(z+sz*d/2),y+sy*h/2) for sx,sy,sz in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]])
 for f in [(0,1,2,3),(4,7,6,5),(0,4,5,1),(3,2,6,7),(0,3,7,4),(1,5,6,2)]:faces.append(tuple(off+i for i in f))
proxy(3.15,-.005,3.525,6.30,.04,7.05)
proxy(.0,1.385,3.525,.15,2.77,7.05);proxy(3.15,1.385,2.185,.15,2.77,4.37)
proxy(3.15,1.385,7.05,6.30,2.77,.15)
proxy(5.035,1.385,6.15,.012,2.70,1.72);proxy(5.625,1.385,6.965,1.20,2.70,.012)
proxy(5.625,1.385,4.447,1.20,2.70,.006);proxy(6.222,1.385,5.74,.008,2.70,2.62)
proxy(6.15,.50,6.24,.30,1,.28);proxy(6.15,2.075,6.24,.30,1.39,.28)
for z in [6.116,6.364]:proxy(6.15,1.19,z,.30,.38,.032)
proxy(6.19,1.19,6.24,.22,.38,.216)
proxy(6.02,.795,4.89,.38,.14,.50)
bvh=BVHTree.FromPolygons(verts,faces,all_triangles=False,epsilon=.00001)
# Cosine-weighted Hammersley-like hemisphere, stable across reproducible rebuilds.
directions=[]
for i in range(32):
 r=math.sqrt((i+.5)/32);a=i*math.pi*(3-math.sqrt(5));directions.append((r*math.cos(a),r*math.sin(a),math.sqrt(1-r*r)))
for file,objects,root in assets:
 if os.environ.get('HW_BAKE_FILES') and file not in os.environ['HW_BAKE_FILES'].split(','):continue
 started=time.time();cache={};count=0;lowest=1.;total=0
 radius=.14 if file=='final-room-props.glb' else .20
 for o in objects:
  if o.type!='MESH':continue
  me=o.data;materialName=' '.join(m.name.lower() for m in me.materials if m);
  # Broad manufactured panels have sparse planar vertices. A gentle AO blend
  # avoids interpolating dark corner samples into false triangular face stains.
  blend=0 if 'clear acrylic' in materialName else .22 if any(t in materialName for t in ['lacquer','enamel','cabinet laminate','timber','stainless','chrome']) else .22 if 'straw' in materialName else .65 if 'polymer' in materialName else 1.0
  normalMat=o.matrix_world.to_3x3().inverted().transposed();world=o.matrix_world
  # Corner normals preserve hard metal/laminate edges while sampling cloth's
  # actual smoothed surface. Exported RGB is a scalar occlusion, never color art.
  attr=me.color_attributes.get('Geometry contact AO') or me.color_attributes.new(name='Geometry contact AO',type='BYTE_COLOR',domain='CORNER')
  me.color_attributes.active_color=attr
  for k,loop in enumerate(me.loops):
   pos=world@me.vertices[loop.vertex_index].co;n=(normalMat@me.corner_normals[k].vector).normalized()
   key=tuple(round(v,3) for v in pos)+tuple(round(v,2) for v in n)
   value=cache.get(key)
   if value is None:
    tangent=n.cross(Vector((0,0,1)))
    if tangent.length<.01:tangent=n.cross(Vector((0,1,0)))
    tangent.normalize();bitangent=n.cross(tangent);origin=pos+n*.0008;occlusion=0
    for u,v,w in directions:
     direction=tangent*u+bitangent*v+n*w;hit,hn,hi,d=bvh.ray_cast(origin,direction,radius)
     if hit is not None and d>.0003:occlusion+=(1-d/radius)**1.3
    value=max(.32,1-occlusion/32*1.45);cache[key]=value
   value=1-(1-value)*blend;attr.data[k].color=(value,value,value,1);lowest=min(lowest,value);total+=value;count+=1
 print(file,'contact samples',len(cache),'min',round(lowest,3),'mean',round(total/max(1,count),3),'seconds',round(time.time()-started,1),flush=True)
 # Remove only the temporary placement transform. Original geometry and logical
 # groups are exported exactly in their existing asset coordinate systems.
 matrix=root.matrix_basis.copy();root.matrix_basis=Matrix.Identity(4);bpy.context.view_layer.update()
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.ops.export_scene.gltf(filepath=str(out/file),export_format='GLB',export_apply=True,export_yup=True,export_materials='EXPORT',use_selection=True,export_vertex_color='ACTIVE',export_all_vertex_colors=False)
 root.matrix_basis=matrix;bpy.context.view_layer.update()
print('Geometry contact bake complete; architecture and dynamic assets unchanged',flush=True)
