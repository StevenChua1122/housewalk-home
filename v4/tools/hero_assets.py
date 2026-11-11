"""Author matched upholstery and draped/tied curtains in metres. No downloaded furniture."""
import bpy, math
from mathutils import Vector
from pathlib import Path
out=Path(__file__).resolve().parents[1]/'assets/models';out.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mat(name,col,rough=.85):
 m=bpy.data.materials.new(name);m.diffuse_color=(*col,1);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*col,1);bs.inputs['Roughness'].default_value=rough
 if 'Sheen Weight' in bs.inputs:bs.inputs['Sheen Weight'].default_value=.25
 return m
grey=mat('Grey woven upholstery',(.37,.36,.34));cream=mat('Cream linen',(.87,.82,.73));orange=mat('Warm rust orange textile',(.66,.23,.055));seam=mat('Tailored grey piping',(.34,.33,.31));wood=mat('Dark timber feet',(.10,.065,.04),.6)
def xyz(p):return (p[0],-p[2],p[1])
def soft(name,loc,size,r,material,sub=1):
 bpy.ops.mesh.primitive_cube_add(size=1,location=xyz(loc));o=bpy.context.object;o.name=name;o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 b=o.modifiers.new('Upholstered edge radius','BEVEL');b.width=r;b.segments=5
 if sub:
  q=o.modifiers.new('Cushion surface','SUBSURF');q.levels=sub;q.render_levels=sub
 for f in o.data.polygons:f.use_smooth=True
 o.data.materials.append(material);return o
def cord(name,points,r,m):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=12;c.bevel_depth=r;c.bevel_resolution=3
 p=c.splines.new('POLY');p.points.add(len(points)-1)
 for q,v in zip(p.points,points):q.co=(*xyz(v),1)
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(m);return o
def rounded_path(cx,y,cz,w,d,r):
 p=[]
 for xx,zz,a in [(cx+w/2-r,cz+d/2-r,0),(cx-w/2+r,cz+d/2-r,90),(cx-w/2+r,cz-d/2+r,180),(cx+w/2-r,cz-d/2+r,270)]:
  for k in range(10):
   an=math.radians(a+k*90/9);p.append((xx+r*math.cos(an),y,zz+r*math.sin(an)))
 return p+[p[0]]
soft('Continuous sofa plinth',(.535,.205,2.39),(.93,.25,2.19),.07,grey,1)
soft('Soft upholstered back',(.16,.58,2.39),(.20,.64,2.20),.07,grey,1)
for z in [1.30,3.48]:soft('Rounded arm',(.535,.46,z),(.96,.45,.18),.065,grey,1)
for k,z in enumerate([1.69,2.37,3.05]):
 soft('Seat cushion '+str(k+1),(.60,.405,z),(.75,.15,.65),.055,grey,1)
 back=soft('Reclined back cushion '+str(k+1),(.285,.68,z),(.245,.54,.65),.08,grey,1);back.rotation_euler[1]=math.radians(-8)
 cord('Seat tailored piping '+str(k+1),rounded_path(.60,.461,z,.72,.62,.055),.0035,seam)
 # Seat piping remains; omit untransformed trim around the reclined back cushion.
for x in [.15,.90]:
 for z in [1.38,3.39]:soft('Recessed timber foot',(x,.085,z),(.07,.15,.07),.008,wood,0)
# Gentle pressure-shaped pillows with small edge creases, retaining exact approved palette.
for k,(z,m,a) in enumerate([(1.80,cream,-12),(2.42,orange,-19),(3.02,cream,-10)]):
 o=soft('Accent pillow '+str(k+1),(.44,.705,z),(.17,.45,.43),.075,m,2)
 o.rotation_euler[1]=math.radians(-15);o.rotation_euler[2]=math.radians(a)
 # Subtle textile deformation is intentionally small, not lumpy noise.
 tex=bpy.data.textures.new('Cushion cloth compression '+str(k),'CLOUDS');tex.noise_scale=.13
 dis=o.modifiers.new('Subtle cloth pressure','DISPLACE');dis.texture=tex;dis.strength=.003;dis.texture_coords='GLOBAL'
 # Piping follows the pillow's rounded face perimeter and transform.
 pts=[]
 for i in range(65):
  t=i*math.tau/64;yy=.197*math.copysign(abs(math.sin(t))**.48,math.sin(t));zz=.188*math.copysign(abs(math.cos(t))**.48,math.cos(t));pts.append((.53,.705+yy,z+zz))
 # Accent cushion edge is supplied by the rounded cloth geometry; avoid detached trim.
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(out/'sofa-tailored.glb'),export_format='GLB',export_apply=True,export_yup=True,export_texcoords=True,export_normals=True,export_materials='EXPORT')
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
cloth=mat('Taupe blackout fabric',(.36,.29,.225),.86)
# Continuous varying-width drape; both edges/gathering follow the real window photograph.
for side in [-1,1]:
 U,V=88,80;verts=[];faces=[];uv=[]
 outer=1.34 if side==-1 else 3.12
 for j in range(V+1):
  t=j/V;y=.025+2.61*t
  width=.35+.40*t**1.7-.15*math.exp(-((t-.30)/.16)**2)
  for i in range(U+1):
   u=i/U
   warped=u+.14*u*(1-u)*math.sin(u*9+.6*side)+.06*u*(1-u)*math.sin(u*23+1.2)
   ph=warped*math.tau*6.1+.25*math.sin(t*3+u*7+side)+.12*math.sin(t*5+u*13)
   amp=(.020+.014*t)*(1+.23*math.sin(u*15+side)+.12*math.sin(u*33+t))*(1-.45*math.exp(-((t-.30)/.15)**2))
   fold=amp*(math.sin(ph)+.025*math.sin(ph*2+.5))
   x=outer+(-side)*width*u
   z=.965+fold+.065*math.sin(math.pi*t)*(1-t)+.014*math.sin(u*9+t*5+side)
   yy=y-.055*math.sin(math.pi*u)*math.sin(math.pi*t)*(1-.8*math.exp(-((t-.30)/.15)**2))+.003*math.sin(ph)*(1-t)**5
   verts.append(xyz((x,yy,z)));uv.append((u*1.3,t*3.8))
 for j in range(V):
  for i in range(U):
   a=j*(U+1)+i;faces.append((a,a+1,a+U+2,a+U+1))
 me=bpy.data.meshes.new('Drape topology');me.from_pydata(verts,[],faces);me.update()
 ob=bpy.data.objects.new('Left tied curtain' if side==-1 else 'Right tied curtain',me);bpy.context.collection.objects.link(ob)
 uv_layer=me.uv_layers.new(name='Fabric metre UV')
 for face in me.polygons:
  face.use_smooth=True
  for li in face.loop_indices:uv_layer.data[li].uv=uv[me.loops[li].vertex_index]
 ob.data.materials.append(cloth)
 sol=ob.modifiers.new('True fabric thickness','SOLIDIFY');sol.thickness=.005;sol.offset=0
 # Fold-following sewn hems; no bright straight rods running through the cloth.
 for j in [0,V]:cord('Double sewn curtain hem',[verts2 for verts2 in []] if False else [(verts[j*(U+1)+i][0],verts[j*(U+1)+i][2],-verts[j*(U+1)+i][1]) for i in range(U+1)],.003,cloth)
 # Tieback is a soft narrow band in front of the gathered cloth, not a straight pole.
 y=.80;t=(y-.025)/2.61;w=.35+.40*t**1.7-.15*math.exp(-((t-.30)/.16)**2)
 pts=[]
 for i in range(32):
  u=i/31;x=outer+(-side)*w*u;z=1.025+.025*math.sin(u*math.pi);pts.append((x,y-.02*math.sin(u*math.pi),z))
 cord('Fabric tieback',pts,.018,cloth)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(out/'curtains-draped.glb'),export_format='GLB',export_apply=True,export_yup=True,export_texcoords=True,export_normals=True,export_materials='EXPORT')
print('Authored assets exported',out)
