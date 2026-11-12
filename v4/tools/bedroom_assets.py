"""Matched bedroom soft furnishings, in the existing apartment's metre coordinates.
No private photograph or mockup is embedded. Blender 4.3, glTF Y-up export.
"""
import bpy, math
from pathlib import Path

out=Path(__file__).resolve().parents[1]/'assets/models'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def xyz(p): return (p[0],-p[2],p[1])
def material(name,c):
 m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*c,1)
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*c,1);bs.inputs['Roughness'].default_value=.9
 return m
grey=material('Bedroom grey upholstery',(.36,.35,.33))
cream=material('Bedroom cream woven linen',(.84,.80,.72))
taupe=material('Bedroom taupe blackout drapery',(.46,.39,.32))
def soft(name,p,size,r,m,sub=1):
 bpy.ops.mesh.primitive_cube_add(size=1,location=xyz(p));o=bpy.context.object;o.name=name
 o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 b=o.modifiers.new('Soft radius','BEVEL');b.width=r;b.segments=5
 if sub: q=o.modifiers.new('Soft silhouette','SUBSURF');q.levels=sub
 for f in o.data.polygons:f.use_smooth=True
 o.data.materials.append(m);return o
def mesh(name,v,f,uv,m,thickness=0):
 me=bpy.data.meshes.new(name);me.from_pydata([xyz(p) for p in v],[],f);me.update()
 o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o)
 ul=me.uv_layers.new(name='Textile UV')
 for face in me.polygons:
  face.use_smooth=True
  for li in face.loop_indices:ul.data[li].uv=uv[me.loops[li].vertex_index]
 o.data.materials.append(m)
 if thickness:s=o.modifiers.new('Fabric thickness','SOLIDIFY');s.thickness=thickness;s.offset=0
 return o

# Head at the east feature wall; foot faces the fixed west-side circulation aisle.
soft('Grey upholstered bed frame',(5.11,.235,2.44),(2.12,.40,1.64),.055,grey)
soft('Cream mattress',(5.13,.50,2.44),(2.00,.22,1.54),.065,cream)
soft('Fitted linen sheet',(5.13,.612,2.44),(2.01,.035,1.55),.016,cream)
soft('Headboard backing',(6.13,.67,2.44),(.13,1.04,1.70),.025,grey)
for k in range(6):
 soft('Vertical padded headboard channel '+str(k+1),(6.045,.69,1.745+k*.278),(.13,.99,.267),.035,grey)
for z in [2.04,2.83]:
 bpy.ops.mesh.primitive_uv_sphere_add(segments=64,ring_count=32,radius=1,location=xyz((5.73,.733,z)))
 o=bpy.context.object;o.name='Soft cream sleeping pillow'
 for v in o.data.vertices:
  old=v.co.copy();x=.245*math.copysign(abs(old.x)**.40,old.x);y=.345*math.copysign(abs(old.y)**.40,old.y)
  crease=.004*math.sin(math.atan2(old.y,old.x)*10)*max(0,old.z)*(1-old.z**2)
  h=.060*old.z+crease;angle=.24 if z<2.4 else .29
  v.co=(x*math.cos(angle)-h*math.sin(angle),y,x*math.sin(angle)+h*math.cos(angle))
 for f in o.data.polygons:f.use_smooth=True
 o.data.materials.append(cream)

# A continuous duvet with rounded side/foot drops, low-amplitude pressure folds,
# a turned-back top and soft corner drape. The geometry supplies the large folds.
U,V=86,102;v=[];uv=[];f=[]
for j in range(V+1):
 q=j/V;rawx=3.85+1.94*q
 foot=max(0,min(1,(4.15-rawx)/.30))
 x=4.15-.16*math.sin(foot*math.pi/2) if foot else rawx
 for i in range(U+1):
  u=-1.04+2.08*i/U;s=max(0,min(1,(abs(u)-.73)/.31))
  z=2.44+math.copysign(.73+.14*math.sin(s*math.pi/2),u) if s else 2.44+u
  y=.637-.34*max(s,foot)
  envelope=.5+.5*math.sin(q*math.pi)
  wrinkles=.004*math.sin(u*38+q*13)+.003*math.sin(u*67-q*17)+.014*math.sin(u*9+q*15)*envelope
  ridge=.021*math.exp(-((u-(-.25+.42*q))/.055)**2)*math.exp(-((q-.45)/.36)**2)
  ridge+=.014*math.exp(-((u-(.43-.22*math.sin(q*3)))/.045)**2)*math.exp(-((q-.65)/.30)**2)
  y+=(wrinkles+ridge)*(.6+.4*(1-s))+.014*math.sin(q*8+u*4)
  if q>.86:y+=.040*math.sin((q-.86)/.14*math.pi)
  x+=.005*math.sin(u*22+q*5);z+=.004*math.sin(q*29+u*5)
  v.append((x,y,z));uv.append((i/U*2.2,q*2.6))
for j in range(V):
 for i in range(U):
  a=j*(U+1)+i;f.append((a,a+1,a+U+2,a+U+1))
mesh('Draped cream duvet',v,f,uv,cream,.006)
# A separate turned-back cuff gives the duvet an identifiable layered head edge.
U,V=76,22;vv=[];ff=[];uvv=[]
for j in range(V+1):
 t=j/V;x=5.41+.31*t
 for i in range(U+1):
  u=-.77+1.54*i/U;y=.66+.030*math.sin(t*math.pi)+.010*math.sin(u*10+t*4)+.005*math.sin(u*31+t*7)
  vv.append((x+.006*math.sin(u*7),y,2.44+u));uvv.append((i/U*1.6,t*.5))
for j in range(V):
 for i in range(U):
  a=j*(U+1)+i;ff.append((a,a+1,a+U+2,a+U+1))
mesh('Turned duvet cuff',vv,ff,uvv,cream,.007)

# Open / tied-back panels in the existing north recess, not a curtain-wall swap.
for side in [-1,1]:
 U,V=84,72;v=[];f=[];uv=[];outer=3.24 if side==-1 else 4.99
 for j in range(V+1):
  t=j/V;width=.29+.44*t**1.8-.13*math.exp(-((t-.31)/.18)**2)
  for i in range(U+1):
   u=i/U;w=u+.20*u*(1-u)*math.sin(9*u+side)+.11*u*(1-u)*math.sin(19*u+.7)
   ph=w*math.tau*4.8+.40*math.sin(t*2.6+u*5+side)
   amp=(.030+.012*t)*(1+.28*math.sin(u*17+side)+.16*math.sin(u*29+t))*(1-.45*math.exp(-((t-.31)/.16)**2))
   x=outer-side*width*u;y=.028+2.61*t-.055*math.sin(math.pi*u)*math.sin(math.pi*t)
   z=.425+amp*(math.sin(ph)+.09*math.sin(ph*2+.4))+.043*math.sin(t*math.pi)*math.sin(u*4+side)
   v.append((x,y,z));uv.append((u*1.5,t*4.0))
 for j in range(V):
  for i in range(U):
   a=j*(U+1)+i;f.append((a,a+1,a+U+2,a+U+1))
 mesh('Open tied bedroom curtain '+str(side),v,f,uv,taupe,.006)
 # Broad fabric tie follows the gathered profile without a bright rigid rod.
 t=.31;width=.29+.44*t**1.8-.13
 vv=[];ff=[];uvv=[]
 for j in range(2):
  for i in range(33):
   u=i/32;vv.append((outer-side*width*u,.83+(j-.5)*.038-.02*math.sin(u*math.pi),.485+.012*math.sin(u*math.pi)));uvv.append((u,j))
 for i in range(32):ff.append((i,i+1,i+34,i+33))
 mesh('Bedroom fabric tieback '+str(side),vv,ff,uvv,taupe,.003)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(out/'bedroom-soft.glb'),export_format='GLB',export_apply=True,export_yup=True,export_texcoords=True,export_normals=True)
print('Bedroom soft assets exported')
