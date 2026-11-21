"""Focused owner-reference props. Blender metre coordinates -> local Y-up GLBs.

The optional mug texture is an isolated object-artwork crop prepared locally from
IMG_9974, never a room photo. No reference scene, plan or personal imagery ships.
Run: HW_MUG_ART=/path/to/isolated-art.png blender -b --python v4/tools/final_assets.py
"""
import bpy, math, os, random, json, struct, tempfile
from pathlib import Path
from mathutils import Vector

random.seed(1511)
out = Path(__file__).resolve().parents[1] / 'assets/models'
# Rebuilds retain the exact shipped isolated artwork without needing the private
# photograph. First builds require the locally prepared crop explicitly.
if not os.environ.get('HW_MUG_ART'):
 existing=out/'final-room-props.glb'
 if not existing.exists():raise RuntimeError('Set HW_MUG_ART to the isolated IMG_9974 mug artwork crop for the first build')
 data=existing.read_bytes();n=struct.unpack_from('<I',data,12)[0];doc=json.loads(data[20:20+n]);binary=data[28+n:]
 material=next(m for m in doc['materials'] if m['name']=='IMG_9974 isolated mug artwork')
 texture=doc['textures'][material['pbrMetallicRoughness']['baseColorTexture']['index']]
 view=doc['bufferViews'][doc['images'][texture['source']]['bufferView']];start=view.get('byteOffset',0)
 art=Path(tempfile.gettempdir())/'housewalk-isolated-mug-art.png';art.write_bytes(binary[start:start+view['byteLength']]);os.environ['HW_MUG_ART']=str(art)
if not Path(os.environ['HW_MUG_ART']).is_file():raise RuntimeError('Required isolated mug artwork is missing: '+os.environ['HW_MUG_ART'])
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
def xyz(p): return (p[0], -p[2], p[1])
def mat(name, rgb, rough=.65, metallic=0):
 m=bpy.data.materials.new(name); m.use_nodes=True; m.diffuse_color=(*rgb,1)
 bs=m.node_tree.nodes.get('Principled BSDF'); bs.inputs['Base Color'].default_value=(*rgb,1); bs.inputs['Roughness'].default_value=rough; bs.inputs['Metallic'].default_value=metallic
 return m
white=mat('Warm white ceramic',(.91,.90,.86),.25); black=mat('Black rack enamel',(.025,.029,.030),.4,.3)
steel=mat('Brushed stainless',(.55,.56,.54),.28,.85); red=mat('Red dustpan and collar',(.62,.018,.012),.65)
blue=mat('Original mug blue',(.035,.075,.16),.24); pale=mat('Pale beige shelf',(.72,.62,.43),.65)
green=mat('Green pump bottle',(.12,.47,.22),.35); cyan=mat('Blue pump bottle',(.018,.48,.62),.35)
straw=mat('Natural straw fibres',(.62,.39,.13),.96); grey=mat('Grey straight handle',(.32,.33,.32),.65,.15)
cream=mat('Cream appliance',(.91,.87,.74),.35); brown=mat('Amber condiment glass',(.35,.13,.018),.28)
yellow=mat('Golden oil',(.72,.46,.025),.27); navy=mat('Navy shampoo',(.018,.045,.085),.36)
orange=mat('Orange pump soap',(.85,.28,.06),.4); cloth=mat('Blue towel',(.07,.34,.46),.95)
pink=mat('Pink bucket',(.66,.12,.25),.55); purple=mat('Purple bucket',(.38,.24,.48),.55)
teal=mat('Teal nested pail',(.025,.35,.42),.5); lime=mat('Lime mop strands',(.57,.72,.025),.9)
def finish(o,name,m):
 o.name=name; o.data.materials.append(m)
 for p in o.data.polygons:p.use_smooth=True
 return o
def box(name,p,size,m,r=.008):
 bpy.ops.mesh.primitive_cube_add(size=1,location=xyz(p));o=bpy.context.object;o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if r: mod=o.modifiers.new('Soft manufactured edges','BEVEL');mod.width=r;mod.segments=3
 return finish(o,name,m)
def ball(name,p,size,m):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,radius=1,location=xyz(p));o=bpy.context.object;o.scale=(size[0],size[2],size[1]);return finish(o,name,m)
def cyl(name,p,r,h,m,r2=None):
 bpy.ops.mesh.primitive_cone_add(vertices=32,radius1=r,radius2=r if r2 is None else r2,depth=h,location=xyz(p));return finish(bpy.context.object,name,m)
def cord(name,pts,r,m):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=3;c.bevel_depth=r;c.bevel_resolution=2
 s=c.splines.new('POLY');s.points.add(len(pts)-1)
 for v,p in zip(s.points,pts):v.co=(*xyz(p),1)
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(m);return o
def group(name,build):
 before=set(bpy.context.scene.objects);build();objects=list(set(bpy.context.scene.objects)-before)
 # Apply and batch within each logical prop to keep runtime draw calls bounded.
 bymat={}
 for o in objects:
  bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
  if o.type=='CURVE':bpy.ops.object.convert(target='MESH')
  for mod in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
  bymat.setdefault(o.data.materials[0].name,[]).append(o)
 root=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(root)
 for obs in bymat.values():
  bpy.ops.object.select_all(action='DESELECT')
  for o in obs:o.select_set(True)
  bpy.context.view_layer.objects.active=obs[0];bpy.ops.object.join();o=obs[0];o.name=name+' / '+o.data.materials[0].name;o.parent=root
 return root
def bottle(name,x,y,z,m,h=.17,r=.026,pump=False):
 cyl(name,(x,y+h*.43,z),r,h*.86,m,r*.9);cyl(name+' neck',(x,y+h*.91,z),r*.5,h*.12,white)
 if pump:
  cyl(name+' pump',(x,y+h+.006,z),.005,.027,white);box(name+' spout',(x-.012,y+h+.018,z),(.034,.008,.009),white,.003)
 else:cyl(name+' cap',(x,y+h*.99,z),r*.58,.024,red if m==brown else white)
def mug(x,z):
 # Open vessel with thickness, interior and an independent curved handle.
 N=48;profile=[(.029,.923),(.037,1.018),(.0345,1.021),(.032,1.014),(.026,.931),(0,.931)]
 v=[];f=[]
 for r,y in profile:
  for i in range(N):a=i*math.tau/N;v.append(xyz((x+r*math.cos(a),y,z+r*math.sin(a))))
 for j in range(len(profile)-1):
  for i in range(N):a=j*N+i;b=j*N+(i+1)%N;f.append((a,a+N,b+N,b))
 me=bpy.data.meshes.new('Open mug');me.from_pydata(v,[],f);me.update();o=bpy.data.objects.new('Original blue mug',me);bpy.context.collection.objects.link(o);finish(o,'Original blue mug',blue)
 cord('Mug handle',[(x+.033+.025*math.sin(t),.973+.032*math.cos(t),z) for t in [i*math.pi/24 for i in range(25)]],.006,blue)
 # Only photographed front artwork. The unseen reverse remains plain blue.
 if os.environ.get('HW_MUG_ART'):
  if not bpy.data.materials.get('IMG_9974 isolated mug artwork'):
   m=mat('IMG_9974 isolated mug artwork',(1,1,1),.3);n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=bpy.data.images.load(os.environ['HW_MUG_ART']);n.image.pack();m.node_tree.links.new(n.outputs['Color'],m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
  m=bpy.data.materials['IMG_9974 isolated mug artwork'];vv=[];uv=[];ff=[]
  for j in range(2):
   y=.935+j*.077
   for i in range(33):
    u=i/32;a=math.pi*7/6+u*math.pi*2/3;r=.0308+j*.007
    vv.append(xyz((x+r*math.cos(a),y,z+r*math.sin(a))));uv.append((1-u,j))
  for i in range(32):ff.append((i,i+33,i+34,i+1))
  me=bpy.data.meshes.new('Curved photographed mug artwork');me.from_pydata(vv,[],ff);me.update();layer=me.uv_layers.new()
  for face in me.polygons:
   for li in face.loop_indices:layer.data[li].uv=uv[me.loops[li].vertex_index]
  o=bpy.data.objects.new('Original mug front artwork',me);bpy.context.collection.objects.link(o);finish(o,o.name,m)
def appliances():
 # Washer bounds x=4.245..4.855, top=.875; exactly these two appliances.
 cyl('Rice cooker',(4.68,.978,6.66),.102,.18,white);cyl('Rice cooker lid',(4.68,1.075,6.66),.105,.025,cream)
 box('Rice cooker lid grip',(4.68,1.10,6.66),(.08,.025,.022),white)
 box('Rice cooker front controls',(4.68,.978,6.553),(.075,.075,.008),red,.006)
 cyl('Electric kettle',(4.43,.982,6.65),.068,.20,white);cyl('Kettle lid',(4.43,1.088,6.65),.061,.018,cream)
 cord('Kettle handle',[(4.48+.055*math.sin(t),.99+.075*math.cos(t),6.65) for t in [i*math.pi/18 for i in range(19)]],.012,white)
 cord('Kettle spout',[(4.39,1.03,6.65),(4.35,1.065,6.65),(4.35,1.082,6.65)],.018,white)
def countertop():
 for x in [4.19,4.81]:
  for z in [6.49,6.90]:cord('Black rack upright',[(x,.89,z),(x,1.53,z)],.010,black)
 for y in [.90,1.49]:
  for z in [6.49,6.90]:cord('Black rack rail',[(4.19,y,z),(4.81,y,z)],.009,black)
  for x in [4.19,4.81]:cord('Black rack side',[(x,y,6.49),(x,y,6.90)],.009,black)
 for x in [4.22,4.32,4.42,4.52,4.62,4.72,4.79]:cord('Dish rack bars',[(x,1.48,6.49),(x,1.48,6.90)],.003,black)
 for x in [4.65,4.71]:
  o=cyl('Simple white plate',(x,1.59,6.72),.095,.012,white);o.rotation_euler[1]=math.pi/2
 ball('Single rack bowl',(4.37,1.515,6.70),(.075,.044,.075),white)
 cyl('Utensil holder',(4.24,.997,6.87),.046,.18,cream)
 for x,m in [(4.22,cyan),(4.26,white)]:
  cord('Prominent blue and white utensil',[(x,1.02,6.87),(x,1.33,6.87)],.006,steel);ball('Utensil head',(x,1.35,6.87),(.018,.038,.012),m)
 # Pale-beige shelf; only two mugs underneath; three simplified condiment bottles.
 box('Pale beige shelf',(3.48,1.075,6.83),(.36,.020,.24),pale)
 for x in [3.31,3.65]:box('White shelf leg',(x,.99,6.83),(.018,.17,.24),white,.003)
 for x,m,h in [(3.36,brown,.22),(3.48,yellow,.23),(3.59,brown,.19)]:bottle('Shelf bottle',x,1.085,6.83,m,h,.025)
 mug(3.40,6.73);mug(3.56,6.73)
 bottle('Sink green soap',4.10,.914,6.89,green,.13,.025,True)
 cyl('White water flask',(3.95,1.055,6.91),.052,.28,white);cyl('Water flask cap',(3.95,1.20,6.91),.05,.018,cream)
 box('Grey drying cloth',(3.65,.919,6.48),(.36,.010,.24),mat('Grey drying textile',(.12,.13,.14),.95),.01)
 # Two retained covered pans on the existing gas hob, with actual handles.
 for x,r,h in [(3.13,.115,.12),(2.76,.073,.14)]:
  cyl('Covered hob pan',(x,1.00+h/2,6.66),r,h,cream);ball('Pan lid',(x,1.00+h,6.66),(r,.023,r),white);box('Lid handle',(x,1.035+h,6.66),(.045,.025,.018),cream)
  cord('Pan handle',[(x-.09,1.06,6.66),(x-.18,1.06,6.66)],.014,black)
def bin_mesh():
 # 0.60 m clear of washer's front (z=6.31); remains in kitchen footprint.
 x,z=4.56,5.56;w,d=.24,.28
 box('Bin floor',(x,.025,z),(w,.018,d),black,.003)
 for y in [.035,.37]:
  cord('Mesh bin rim',[(x-w/2,y,z-d/2),(x+w/2,y,z-d/2),(x+w/2,y,z+d/2),(x-w/2,y,z+d/2),(x-w/2,y,z-d/2)],.005,black)
 for i in range(17):
  u=i/16
  for zz in [z-d/2,z+d/2]:cord('Bin mesh vertical',[(x-w/2+u*w,.04,zz),(x-w/2+u*w,.37,zz)],.0009,black)
  for xx in [x-w/2,x+w/2]:cord('Bin mesh vertical',[(xx,.04,z-d/2+u*d),(xx,.37,z-d/2+u*d)],.0009,black)
 for y in [.06+i*.018 for i in range(17)]:cord('Bin mesh horizontal',[(x-w/2,y,z-d/2),(x+w/2,y,z-d/2),(x+w/2,y,z+d/2),(x-w/2,y,z+d/2),(x-w/2,y,z-d/2)],.0008,black)
def bathroom():
 for z,m in [(4.98,green),(5.075,cyan)]:bottle('Only sink bottle',6.11,.867,z,m,.16,.025,True)
 # Window-sill items and floor sandals occur in the approved closed-door view.
 bottle('Window reed diffuser',6.14,1.06,5.33,brown,.10,.022)
 for i in range(5):cord('Diffuser reed',[(6.14,1.16,5.33),(6.14+(i-2)*.012,1.39,5.33+(i%2)*.009)],.0012,black)
 cyl('Orange window soap',(6.14,1.13,5.94),.032,.14,orange)
 cyl('Yellow window soap pump',(6.14,1.218,5.94),.012,.035,yellow);box('Window soap spout',(6.13,1.237,5.94),(.045,.009,.013),yellow,.003)
 for x,z in [(5.47,4.72),(5.57,4.76)]:
  ball('Black sandal footbed',(x,.034,z),(.041,.013,.095),black)
  cord('Sandal Y strap',[(x-.035,.045,z+.008),(x,.065,z-.038),(x+.035,.045,z+.008)],.006,black)
  cord('Sandal toe post',[(x,.035,z-.04),(x,.065,z-.038)],.005,black)
 # Triangular wall-corner storage, three trays, slim matching white frame.
 corners=[(5.065,6.93),(5.365,6.93),(5.065,6.63)]
 for x,z in corners:cord('Triangular shelf post',[(x,.03,z),(x,.91,z)],.009,white)
 for y in [.12,.46,.80]:
  vv=[xyz((x,y,z)) for x,z in corners];me=bpy.data.meshes.new('Triangular tray');me.from_pydata(vv,[],[(0,1,2)]);me.update();o=bpy.data.objects.new('Triangular shelf tier',me);bpy.context.collection.objects.link(o);finish(o,o.name,white);mod=o.modifiers.new('Tray thickness','SOLIDIFY');mod.thickness=.014
  cord('Triangular tray raised rim',[(x,y+.035,z) for x,z in corners+[corners[0]]],.005,white)
 for x,z,m in [(5.10,6.87,white),(5.18,6.88,cyan),(5.11,6.79,navy)]:bottle('Shelf care bottle',x,.81,z,m,.17,.021,True)
 bottle('Shelf amber bottle',5.12,.47,6.86,brown,.15,.024,True);cyl('Shelf jar',(5.22,.51,6.88),.032,.07,cream)
 bottle('Shelf lower bottle',5.12,.135,6.85,cyan,.15,.022)
 for z,m in [(6.17,navy),(6.23,navy),(6.30,cyan)]:bottle('Niche shampoo',6.035,1.015,z,m,.19,.020)
 # Approved closed-door items stay physically present, naturally occluded in open view.
 for x,z,m,r,h in [(5.94,4.75,pink,.11,.25),(5.88,5.02,purple,.115,.25),(5.88,5.02,teal,.10,.28)]:
  N=40;vv=[];ff=[]
  for rr,y in [(r*.8,.025),(r,h),(r-.006,h),(r*.8-.006,.04)]:
   for i in range(N):a=i*math.tau/N;vv.append(xyz((x+rr*math.cos(a),y,z+rr*math.sin(a))))
  for j in range(3):
   for i in range(N):a=j*N+i;b=j*N+(i+1)%N;ff.append((a,a+N,b+N,b))
  me=bpy.data.meshes.new('Open pail');me.from_pydata(vv,[],ff);me.update();o=bpy.data.objects.new('Nested bucket',me);bpy.context.collection.objects.link(o);finish(o,o.name,m)
  cord('Bucket handle',[(x+r*math.cos(a),h-.04-r*.35*math.sin(a),z+r*.45*math.sin(a)) for a in [i*math.pi/24 for i in range(25)]],.004,white)
 # Draped blue towel on the light north wall, not on the door.
 vv=[];ff=[]
 for j in range(13):
  for i in range(9):
   u=(i/8-.5)*(.04+.20*j/12);y=1.76-.32*j/12;z=4.476+.015*math.cos(i*1.7+j*.2);vv.append(xyz((5.62+u,y,z)))
 for j in range(12):
  for i in range(8):a=j*9+i;ff.append((a,a+1,a+10,a+9))
 me=bpy.data.meshes.new('Draped blue towel');me.from_pydata(vv,[],ff);me.update();o=bpy.data.objects.new('Blue wall towel',me);bpy.context.collection.objects.link(o);finish(o,o.name,cloth);mod=o.modifiers.new('Towel thickness','SOLIDIFY');mod.thickness=.003
def broom():
 # Straight handle leans in one line toward the wall; grey, black tip, red collar.
 x,z=2.955,3.97
 box('Red dustpan',(x-.015,.035,z),(.27,.035,.29),red,.012)
 box('Dustpan back',(x+.095,.14,z),(.025,.22,.26),red,.008)
 cord('Dustpan shaft',[(x+.10,.18,z),(x+.10,1.05,z)],.011,grey)
 cord('Broom straight handle',[(x-.04,.32,z),(x+.025,1.39,z)],.010,grey)
 cord('Broom black handle tip',[(x+.020,1.30,z),(x+.025,1.39,z)],.012,black)
 cord('Broom red collar',[(x-.044,.28,z),(x-.034,.42,z)],.024,red)
 for i in range(180):
  a=random.random();b=random.random();xx=x-.12+a*.22;zz=z-.025+b*.05
  cord('Straw broom bristle',[(x-.04+(a-.5)*.025,.31,z+(b-.5)*.012),(xx,.08,zz),(xx,.055,zz)],.0017,straw)
def plush():
 fur=mat('Teddy honey fur',(.53,.30,.09),.96);ivory=mat('Plush ivory',(.88,.84,.72),.96);dollred=mat('Red doll cloth',(.67,.025,.024),.95)
 # Existing sofa remains untouched. Plush arrangement sits on its back and seat.
 for z,m in [(1.46,fur),(1.76,ivory),(2.03,ivory),(2.28,fur)]:
  x=.23;ball('Plush bear body',(x,.98,z),(.10,.15,.12),m);ball('Plush bear head',(x,1.17,z),(.11,.105,.11),m)
  for dz in [-.08,.08]:ball('Plush round ear',(x,1.25,z+dz),(.043,.044,.037),m);ball('Plush foot',(x+.08,.88,z+dz),(.070,.055,.05),m)
  for dz in [-.045,.045]:ball('Plush eye',(x+.102,1.19,z+dz),(.008,.009,.009),black)
  ball('Plush muzzle',(x+.11,1.14,z),(.025,.035,.045),ivory);ball('Plush nose',(x+.132,1.15,z),(.008,.009,.011),black)
 # Red suited seated doll and daisy cushion, both in latest visible Zone A context.
 ball('Red doll body',(.56,.66,2.75),(.115,.15,.12),dollred);ball('Doll face',(.56,.89,2.75),(.105,.105,.105),ivory)
 ball('Red doll cap',(.56,.96,2.75),(.11,.04,.11),dollred)
 for dz in [-.065,.065]:ball('Doll shoe',(.66,.52,2.75+dz),(.08,.055,.045),green);ball('Doll eye',(.66,.90,2.75+dz*.55),(.008,.01,.009),black)
 for k in range(8):a=k*math.tau/8;ball('Daisy cushion petal',(.37,.67+.11*math.sin(a),1.75+.11*math.cos(a)),(.045,.065,.065),ivory)
 ball('Daisy cushion centre',(.42,.67,1.75),(.04,.07,.07),yellow)

def visible_console_details():
 # Only the approved objects visible from the hallway; furniture stays fixed.
 toyblue=mat('Blue plush character',(.025,.30,.61),.92)
 for x,z,m in [(2.73,2.15,toyblue),(2.75,2.60,yellow)]:
  ball('Console character body',(x,.69,z),(.07,.09,.065),m);ball('Console character head',(x,.82,z),(.08,.075,.075),m)
  for dz in [-.065,.065]:
   ball('Console character ear',(x,.86,z+dz),(.025,.055,.04),m);ball('Console character foot',(x-.035,.61,z+dz*.7),(.05,.025,.028),m)
   ball('Console character eye',(x-.072,.83,z+dz*.45),(.01,.014,.011),black)
 box('Pink tissue case',(2.73,.65,2.93),(.20,.13,.15),pink,.025)
 box('White tissue',(2.73,.735,2.93),(.08,.045,.02),white,.008)
 # Sparse grouped trolley contents match the final silhouette and retain open grid.
 for x,z in [(2.75,3.30),(2.87,3.50)]:
  ball('Folded pale trolley linen',(x,.22,z),(.07,.04,.075),cream)
 box('Trolley orange supplies',(2.81,.51,3.42),(.15,.16,.13),orange,.008)
 bottle('Trolley blue bottle',2.78,.43,3.23,navy,.13,.025)
 bottle('Trolley white bottle',2.87,.43,3.26,white,.12,.022)
 box('Trolley pink organiser',(2.81,.73,3.43),(.25,.11,.18),pink,.015)
 bottle('Trolley small pump',2.83,.68,3.20,white,.13,.022,True)

# Local door coordinates: inside is NEGATIVE local Z. Parenting to the existing
# hinge naturally hides the mop behind the open leaf, without visibility toggles.
def mop():
 box('High middle door hook',(.39,1.82,-.045),(.04,.035,.025),steel)
 cord('Door hook return',[(.39,1.82,-.05),(.39,1.80,-.095),(.39,1.83,-.105)],.006,steel)
 cord('Mop long straight handle',[(.39,.39,-.09),(.39,1.81,-.09)],.009,pale)
 cord('Mop red top grip',[(.39,1.70,-.09),(.39,1.81,-.09)],.013,red)
 cyl('Mop head collar',(.39,.38,-.09),.024,.06,lime)
 for i in range(48):
  a=i*2.4;r=.015+.035*(i%7)/6;xx=.39+r*math.cos(a);zz=-.10+r*math.sin(a)
  cord('Long lime mop strands',[(.39+.012*math.cos(a),.365,-.09+.012*math.sin(a)),(xx,.22,zz),(xx+.004*math.sin(i),.12+(i%4)*.008,zz)],.0028,lime)
if __name__=='__main__':
 group('Kitchen washer appliances',appliances);group('Kitchen simplified countertop',countertop);group('Kitchen separated mesh bin',bin_mesh)
 group('Bathroom approved accessories',bathroom);group('Hallway broom and red dustpan',broom);group('Hallway visible sofa plush',plush);group('Hallway visible console and trolley details',visible_console_details)
 bpy.ops.object.select_all(action='SELECT');bpy.ops.export_scene.gltf(filepath=str(out/'final-room-props.glb'),export_format='GLB',export_apply=True,export_yup=True)
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 group('Bathroom inside-door mop',mop)
 bpy.ops.object.select_all(action='SELECT');bpy.ops.export_scene.gltf(filepath=str(out/'bathroom-door-mop.glb'),export_format='GLB',export_apply=True,export_yup=True)
