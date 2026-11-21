"""Blender helpers for PR #8 visual refinement; source coordinates remain metres."""
import bpy, math, sys
from pathlib import Path
from mathutils import Vector,Matrix
sys.path.insert(0,str(Path(__file__).resolve().parent))
import final_assets as A
xyz=A.xyz;box=A.box;cord=A.cord;group=A.group;out=A.out
def cyl(name,p,r,h,m,r2=None):
 o=A.cyl(name,p,r,h,m,r2)
 for face in o.data.polygons:face.use_smooth=len(face.vertices)==4
 return o
def linear(v):return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4
def material(name,color,rough=.6,metal=0):
 color=color.lstrip('#');return A.mat(name,tuple(linear(int(color[i:i+2],16)/255) for i in (0,2,4)),rough,metal)
porcelain=material('Refined glazed porcelain','#f7f5ef',.19)
ivory=material('Refined warm white polymer','#f4f2e9',.37)
white=material('Refined white enamel','#f8f7f3',.35)
black=material('Refined satin black enamel','#252729',.39,.18)
rubber=material('Refined black rubber','#111517',.83)
steel=material('Refined brushed stainless steel','#b8c0c3',.28,.92)
chrome=material('Refined polished chrome','#e0e3e2',.16,.95)
grey=material('Refined grey handle','#7b7e7d',.45,.25)
red=material('Refined red moulded plastic','#cd241c',.42)
straw=material('Refined natural straw fibres','#b88946',.94)
taupe=material('Refined taupe woven textile','#92785f',.92)
cream=material('Refined cream cotton textile','#e7deca',.95)
navy=material('Refined deep blue polymer','#132e48',.38)
blue=material('Refined cyan soap polymer','#1792b2',.38)
green=material('Refined green soap polymer','#58a67b',.38)
pink=material('Refined pink moulded plastic','#c94e79',.49)
purple=material('Refined purple moulded plastic','#927caa',.49)
teal=material('Refined teal moulded plastic','#147f8c',.49)
def mesh(name,v,f,m,uv=None,smooth=True):
 me=bpy.data.meshes.new(name);me.from_pydata([xyz(p) for p in v],[],f);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);me.materials.append(m)
 if uv:
  layer=me.uv_layers.new(name='Surface UV')
  for poly in me.polygons:
   for li in poly.loop_indices:layer.data[li].uv=uv[me.loops[li].vertex_index]
 for p in me.polygons:p.use_smooth=smooth
 return o
def ellipsoid(name,p,size,m,power=1,N=32,R=20,pressure=0):
 # Superellipsoid with tailored flattened sides and small fabric compression.
 v=[];uv=[];f=[]
 def signed(t):return math.copysign(abs(t)**power,t)
 for j in range(R+1):
  lat=-math.pi/2+j*math.pi/R
  for i in range(N+1):
   a=i*math.tau/N;xx=signed(math.cos(lat))*signed(math.cos(a));zz=signed(math.cos(lat))*signed(math.sin(a));yy=signed(math.sin(lat))
   yy+=pressure*math.sin(a*6+.7)*math.cos(lat)**4
   v.append((xx*size[0],yy*size[1],zz*size[2]));uv.append((i/N,j/R))
 for j in range(R):
  for i in range(N):a=j*(N+1)+i;f.append((a,a+N+1,a+N+2,a+1))
 o=mesh(name,v,f,m,uv);o.location=xyz(p);return o
def surface(name,cx,cz,profile,m,N=64,square=1):
 # Revolved closed/open manufactured profile. Radius may be an (x,z) pair.
 v=[];uv=[];f=[]
 for k,item in enumerate(profile):
  r,y=item;rx,rz=r if isinstance(r,(tuple,list)) else (r,r)
  for i in range(N+1):
   a=i*math.tau/N;co=math.copysign(abs(math.cos(a))**square,math.cos(a));si=math.copysign(abs(math.sin(a))**square,math.sin(a));v.append((cx+rx*co,y,cz+rz*si));uv.append((i/N,k/(len(profile)-1)))
 for k in range(len(profile)-1):
  for i in range(N):a=k*(N+1)+i;f.append((a,a+N+1,a+N+2,a+1))
 return mesh(name,v,f,m,uv)
def disk_front(name,p,r,depth,m):
 o=cyl(name,p,r,depth,m);o.rotation_euler[0]=math.pi/2;return o
def tube(name,pts,r,m):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=12;c.bevel_depth=r;c.bevel_resolution=3
 s=c.splines.new('BEZIER');s.bezier_points.add(len(pts)-1)
 for b,p in zip(s.bezier_points,pts):b.co=xyz(p);b.handle_left_type='AUTO';b.handle_right_type='AUTO'
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(m);return o
def ring(name,p,rx,rz,y,r,m):cord(name,[(p[0]+rx*math.cos(a),y,p[2]+rz*math.sin(a)) for a in [i*math.tau/64 for i in range(65)]],r,m)
def softbox(name,p,size,m,r=.02):
 o=box(name,p,size,m,r);mod=o.modifiers.new('Weighted manufactured normals','WEIGHTED_NORMAL');mod.keep_sharp=True;mod.weight=50;return o
def label_band(name,x,y,z,r,h,m):surface(name,x,z,[(r,y),(r,y+h)],m,48)
def bottle(name,x,y,z,m,h=.17,r=.026,pump=False,square=.52):
 surface(name,x,z,[(0,y),(r*.84,y),(r,y+.01),(r,y+h*.71),(r*.88,y+h*.81),(r*.45,y+h*.87),(r*.45,y+h*.95),(0,y+h*.95)],m,48,square)
 if pump:
  cyl(name+' pump collar',(x,y+h*.94,z),r*.52,.020,ivory);cyl(name+' stem',(x,y+h+.005,z),.004,.025,ivory)
  softbox(name+' pump spout',(x-.012,y+h+.018,z),(.034,.008,.012),white,.003)
 else:cyl(name+' screw cap',(x,y+h*.97,z),r*.52,.025,ivory)
 # Simple original label panels only; no invented manufacturer lettering.
 softbox(name+' label',(x,y+h*.43,z-r*.997),((r*1.3),h*.32,.0015),ivory,.001)
def export(file):
 bpy.ops.object.select_all(action='SELECT');bpy.ops.export_scene.gltf(filepath=str(out/file),export_format='GLB',export_apply=True,export_yup=True,export_materials='EXPORT')
def clear():bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)

def reorient_new(before,x,z,angle):
 # Rotate only an individual accessory about its retained centre. Furniture,
 # supporting architecture and camera coordinates never participate.
 bpy.context.view_layer.update()
 pivot=Vector((x,-z,0));M=Matrix.Translation(pivot)@Matrix.Rotation(angle,4,'Z')@Matrix.Translation(-pivot)
 for o in set(bpy.context.scene.objects)-before:o.matrix_world=M@o.matrix_world
 bpy.context.view_layer.update()
