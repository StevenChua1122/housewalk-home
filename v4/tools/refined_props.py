"""Reference-specific props for all three rooms. No room images are embedded.
Run with Blender from this directory; leaves the approved door/mop GLB untouched.
"""
import sys,math,random,bpy
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from refinement_common import *
random.seed(26381)
fur=material('Refined honey plush textile','#b77c3b',.96);furLight=material('Refined muzzle plush textile','#cc9a62',.96)
ivoryFur=material('Refined ivory plush textile','#eee7db',.96);tanFur=material('Refined small tan plush textile','#c3a28a',.96)
greyFur=material('Refined small grey plush textile','#b9b2aa',.96);embroider=material('Refined dark embroidery','#292729',.86)
rose=material('Refined blush plush textile','#ed9d9e',.96);navyCloth=material('Refined navy woven textile','#172d46',.94)
yellow=material('Refined golden plush textile','#edc63e',.94);dollRed=material('Refined red woven textile','#cb1e20',.93)
skin=material('Refined peach doll textile','#f0b998',.94);soleGreen=material('Refined green doll boot textile','#438645',.95)
stitchBlue=material('Refined blue character plush textile','#2f83ba',.94);stitchLight=material('Refined pale blue character plush textile','#71b7c3',.96)
innerEar=material('Refined mauve inner-ear plush textile','#a89db1',.96)
def soft(name,p,s,m,power=.88):
 o=ellipsoid(name,p,s,m,power,N=26,R=16,pressure=.006)
 # Short pile on teddy heads/ears is real geometry, not a painted fur outline.
 # At ~1 mm it softens close silhouettes without changing any toy anchor/shape.
 if 'stuffed head' in name or 'folded round ear' in name:
  from mathutils import Vector
  vertices=[];faces=[];count=360 if 'head' in name else 55
  for i in range(count):
   lat=math.asin(random.uniform(-1,1));a=random.random()*math.tau;sg=lambda t:math.copysign(abs(t)**power,t)
   xx=sg(math.cos(lat))*sg(math.cos(a));zz=sg(math.cos(lat))*sg(math.sin(a));yy=sg(math.sin(lat))+.006*math.sin(a*6+.7)*math.cos(lat)**4
   q=Vector((xx*s[0],yy*s[1],zz*s[2]));normal=Vector((xx/s[0],yy/s[1],zz/s[2])).normalized();tangent=normal.cross(Vector((0,1,0)))
   if tangent.length<.01:tangent=normal.cross(Vector((1,0,0)))
   tangent.normalize();bitangent=normal.cross(tangent);base=len(vertices);radius=.00010;length=random.uniform(.0008,.0016)
   for k in range(3):
    t=k*math.tau/3;v=q-normal*.00015+(tangent*math.cos(t)+bitangent*math.sin(t))*radius;vertices.append(tuple(p[j]+v[j] for j in range(3)))
   tip=q+normal*length;vertices.append(tuple(p[j]+tip[j] for j in range(3)))
   faces.extend([(base,base+1,base+3),(base+1,base+2,base+3),(base+2,base,base+3)])
  mesh(name+' short velvet pile',vertices,faces,m)
 return o
def curve_face(name,c,coords,r,m=embroider):
 # Toy fronts face positive X; all embroidery sits on the visible cloth surface.
 tube(name,[(c[0]+x,c[1]+y,c[2]+z) for x,y,z in coords],r,m)
def eye(name,p,r=.009):
 ellipsoid(name,p,(r*.55,r,r*.78),embroider,N=20,R=12)
 ellipsoid(name+' stitched highlight',(p[0]+r*.45,p[1]+r*.25,p[2]-r*.22),(r*.15,r*.18,r*.15),white,N=12,R=8)
def bear(name,x,z,scale=1,color=fur,shirt=False,heart=False):
 before=set(bpy.context.scene.objects);y=.92;s=scale
 def P(a,b,c):return(x+a*s,y+b*s,z+c*s)
 soft(name+' weighted body',P(0,.145,0),(.082*s,.14*s,.092*s),navyCloth if shirt else color,.90)
 soft(name+' stuffed head',P(0,.335,0),(.094*s,.101*s,.092*s),color,.92)
 for side in [-1,1]:
  soft(name+' folded round ear',P(-.005,.412,side*.081),(.039*s,.047*s,.040*s),color,.85)
  soft(name+' ear inset',P(.030,.411,side*.081),(.007*s,.027*s,.024*s),furLight if color==fur else rose)
  arm=soft(name+' curved arm',P(.018,.175,side*.110),(.043*s,.100*s,.042*s),navyCloth if shirt else color,.88);arm.rotation_euler[0]=side*.12
  soft(name+' paw',P(.033,.095,side*.119),(.040*s,.045*s,.039*s),color)
  soft(name+' seated thigh',P(.052,.060,side*.071),(.078*s,.060*s,.052*s),color,.75)
  soft(name+' foot pad',P(.109,.057,side*.071),(.010*s,.041*s,.036*s),furLight if color==fur else color,.82)
  eye(name+' glossy bead eye',P(.092,.351,side*.043),.007*s)
  curve_face(name+' limb seam',(x,y,z),[(.066*s,.230*s,side*.108*s),(.073*s,.174*s,side*.131*s),(.063*s,.117*s,side*.118*s)],.0009*s,color)
 soft(name+' protruding muzzle',P(.095,.305,0),(.034*s,.035*s,.041*s),furLight if color==fur else ivoryFur,.83)
 soft(name+' triangular nose',P(.129,.322,0),(.012*s,.010*s,.015*s),embroider,.55)
 curve_face(name+' stitched smile',(x,y,z),[(.132*s,.316*s,0),(.134*s,.299*s,0),(.129*s,.292*s,-.013*s)],.0015*s)
 curve_face(name+' centre stitched seam',(x,y,z),[(.087*s,.230*s,0),(.093*s,.170*s,0),(.087*s,.090*s,0)],.0011*s,furLight if color==fur else color)
 if shirt:
  for side in [-1,1]:
   tube(name+' tailored sleeve cuff',[P(.047,.166,side*.090),P(.057,.161,side*.114),P(.043,.164,side*.141)],.002*s,navyCloth)
  tube(name+' shirt lower sewn hem',[P(.071,.065,-.064),P(.088,.067,0),P(.071,.065,.064)],.0015*s,navyCloth)
  tube(name+' yellow collar',[P(.06,.264,-.065),P(.095,.244,0),P(.06,.264,.065)],.009*s,yellow)
  tie=mesh(name+' tapered yellow tie',[P(.105,.238,-.013),P(.105,.238,.013),P(.110,.152,.020),P(.110,.129,0),P(.110,.152,-.020)],[(0,1,2,3,4)],yellow);solid=tie.modifiers.new('Sewn tie thickness','SOLIDIFY');solid.thickness=.004*s
 if heart:
  # Sewn red heart, formed as a single thick curved silhouette.
  vv=[];ff=[]
  for layer in [0,1]:
   for i in range(65):
    t=i*math.tau/64;zz=.0039*16*math.sin(t)**3*s;yy=.0039*(13*math.cos(t)-5*math.cos(2*t)-2*math.cos(3*t)-math.cos(4*t))*s
    vv.append(P(.087+.013*layer,.17+yy/s,zz/s))
  for i in range(64):ff.append((i,i+1,i+66,i+65))
  ff.extend([tuple(range(64,-1,-1)),tuple(range(65,130))]);o=mesh(name+' sewn red heart',vv,ff,dollRed);be=o.modifiers.new('Soft appliqué edge','BEVEL');be.width=.003;be.segments=3
 reorient_new(before,x,z,-.95)
def daisy(name,x,y,z,r):
 before=set(bpy.context.scene.objects)
 for i in range(9):
  t=i*math.tau/9;ob=soft(name+' stuffed petal',(x,y+math.sin(t)*r*.59,z+math.cos(t)*r*.59),(r*.24,r*.40,r*.32),ivoryFur,.74);ob.rotation_euler[0]=math.pi/2-t
 soft(name+' yellow face',(x+r*.24,y,z),(r*.105,r*.36,r*.36),yellow,.80)
 for side in [-1,1]:eye(name+' smiling eye',(x+r*.346,y+r*.08,z+side*r*.13),r*.026)
 curve_face(name+' embroidered smile',(x+r*.35,y,z),[(0,-r*.07,-r*.17),(.001,-r*.16,0),(0,-r*.07,r*.17)],r*.014)
 reorient_new(before,x,z,-1.00)
def seated_doll():
 before=set(bpy.context.scene.objects)
 x,y,z=.56,.49,1.70
 soft('Red festive doll sewn torso',(x,y+.18,z),(.103,.156,.118),dollRed,.67)
 soft('Red festive doll peach face',(x+.005,y+.392,z),(.100,.104,.112),skin,.76)
 # A visible band and curved cap; facial features follow the actual reference.
 soft('Red festive cap crown',(x-.005,y+.470,z),(.101,.060,.113),dollRed,.82)
 soft('Red festive cap ivory band',(x+.047,y+.458,z),(.058,.024,.113),ivoryFur,.74)
 for side in [-1,1]:
  soft('Red festive cap pompom',(x+.012,y+.393,z+side*.111),(.024,.024,.025),ivoryFur)
  soft('Red festive doll sleeve',(x+.012,y+.218,z+side*.124),(.044,.095,.046),dollRed,.84)
  soft('Red festive doll hand',(x+.047,y+.148,z+side*.141),(.035,.035,.035),ivoryFur)
  soft('Red festive doll bent leg',(x+.082,y+.069,z+side*.070),(.084,.075,.063),ivoryFur,.76)
  soft('Red festive doll green boot toe',(x+.142,y+.036,z+side*.070),(.032,.030,.036),soleGreen,.73)
  eye('Red festive doll eye',(x+.102,y+.408,z+side*.040),.009)
  soft('Red festive doll blush',(x+.102,y+.383,z+side*.063),(.006,.014,.018),rose)
 soft('Red festive doll soft nose',(x+.112,y+.383,z),(.010,.012,.012),rose)
 curve_face('Red festive doll smile',(x,y,z),[(.108,.370,-.022),(.114,.358,0),(.108,.370,.022)],.0017,rose)
 for yy in [.255,.188]:soft('Red festive doll ivory button',(x+.104,y+yy,z),(.010,.014,.014),ivoryFur)
 tube('Red festive doll gold placket',[(x+.096,y+.285,z),(x+.112,y+.205,z),(x+.103,y+.12,z)],.003,yellow)
 for side in [-1,1]:tube('Red festive collar trim',[(x+.071,y+.294,z+side*.074),(x+.103,y+.273,z+side*.036),(x+.104,y+.275,z)],.004,yellow)
 reorient_new(before,x,z,-1.05)
def plush():
 # Correct near-to-far identities; each toy has individual seams, pads and face.
 bear('Plain golden teddy',.23,2.37,1.0,fur)
 bear('White heart teddy',.23,2.09,.95,ivoryFur,heart=True)
 bear('Small tan teddy',.23,1.88,.67,tanFur)
 bear('Small grey teddy',.23,1.70,.66,greyFur)
 bear('Navy-shirt golden teddy',.23,1.45,.94,fur,shirt=True)
 daisy('Backrest daisy plush',.35,1.15,1.18,.21)
 daisy('Seat daisy cushion',.48,.667,2.65,.19)
 seated_doll()
def stitch(name,x,y,z,s=1,face=-1,pink_version=False):
 before=set(bpy.context.scene.objects)
 body=rose if pink_version else stitchBlue;belly=ivoryFur if pink_version else stitchLight
 def P(a,b,c):return(x+face*a*s,y+b*s,z+c*s)
 soft(name+' pear-shaped body',P(0,.078,0),(.047*s,.082*s,.056*s),body,.78)
 soft(name+' belly panel',P(.044,.077,0),(.010*s,.052*s,.037*s),belly,.74)
 soft(name+' broad head',P(.008,.182,0),(.063*s,.058*s,.077*s),body,.70)
 for side in [-1,1]:
  # Reference Stitch/Angel silhouettes: tapered, curved wing ears with a
  # small upper notch and a mauve lining, not the previous round disc ears.
  outline=[(.181,.061),(.193,.120),(.275 if not pink_version else .292,.166),(.270,.130),(.245,.125),(.249,.092),(.228,.062)]
  vv=[];ff=[]
  for layer in [0,1]:
   for yy,zz in outline:
    bend=.012-.025*((zz-.06)/.106)**2;vv.append(P(bend-layer*.006,yy,side*zz))
  n=len(outline)
  ff.append(tuple(range(n)));ff.append(tuple(range(2*n-1,n-1,-1)))
  for k in range(n):ff.append((k,(k+1)%n,(k+1)%n+n,k+n))
  o=mesh(name+' tapered notched ear',vv,ff,body);be=o.modifiers.new('Soft sewn ear edge','BEVEL');be.width=.002*s;be.segments=3
  inner=[]
  for yy,zz in outline:
   yy=.228+(yy-.228)*.72;zz=.105+(zz-.105)*.74;bend=.012-.025*((zz-.06)/.106)**2;inner.append(P(bend+.001,yy,side*zz))
  lining=mesh(name+' inset mauve wing-ear lining',inner,[tuple(range(len(inner)))],innerEar);md=lining.modifiers.new('Lining textile thickness','SOLIDIFY');md.thickness=.001*s
  soft(name+' eye mask',P(.059,.187,side*.037),(.010*s,.030*s,.026*s),belly)
  soft(name+' black oval eye',P(.068,.190,side*.037),(.008*s,.022*s,.017*s),embroider)
  soft(name+' eye glint',P(.075,.198,side*.041),(.002*s,.006*s,.004*s),white)
  soft(name+' arm',P(.007,.093,side*.061),(.030*s,.050*s,.026*s),body,.8)
  soft(name+' splayed foot',P(.033,.019,side*.044),(.044*s,.020*s,.030*s),body,.70)
  for offset in [-.012,0,.012]:ellipsoid(name+' three small toe claws',P(.073,.016,side*.044+offset),(.005*s,.006*s,.003*s),navy,N=12,R=8)
 soft(name+' pale muzzle',P(.065,.161,0),(.017*s,.020*s,.035*s),belly,.76)
 soft(name+' broad blue nose',P(.076,.176,0),(.014*s,.017*s,.023*s),navy)
 tube(name+' embroidered mouth',[P(.077,.157,-.025),P(.081,.149,0),P(.077,.157,.025)],.0015*s,embroider)
 reorient_new(before,x,z,1.15)
def physical_frame(name,x,y,z,h,w,angle):
 before=set(bpy.context.scene.objects);rail=.013
 for yy in [y-h/2+rail/2,y+h/2-rail/2]:softbox(name+' horizontal rail',(x,yy,z),(.026,rail,w),ivory,.003)
 for zz in [z-w/2+rail/2,z+w/2-rail/2]:softbox(name+' vertical rail',(x,y,zz),(.026,h-rail*2,rail),ivory,.003)
 backing=material(name+' original photograph unavailable backing','#b9b7b1',.91)
 softbox(name+' recessed backing — original asset unavailable',(x+.009,y,z),(.003,h-.028,w-.028),backing,.001)
 glass=material('Refined clear acrylic frame glass','#edf3ee',.09);glass.diffuse_color=(*glass.diffuse_color[:3],.12);glass.node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value=.12
 if hasattr(glass,'surface_render_method'):glass.surface_render_method='DITHERED'
 softbox(name+' 1.6mm glazing',(x-.006,y,z),(.0016,h-.028,w-.028),glass,.0004)
 tube(name+' rear easel',[(x+.015,y+h*.23,z),(x+.090,y-h/2,z),(x+.014,y-h/2,z)],.004,ivory)
 bpy.context.view_layer.update();pivot=Vector(xyz((x,y-h/2,z)));lean=Matrix.Translation(pivot)@Matrix.Rotation(.11,4,'Y')@Matrix.Translation(-pivot)
 for o in set(bpy.context.scene.objects)-before:o.matrix_world=lean@o.matrix_world
 reorient_new(before,x,z,angle)
 bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get();minimum=10
 for o in set(bpy.context.scene.objects)-before:
  ev=o.evaluated_get(deps);me=ev.to_mesh();minimum=min(minimum,min((ev.matrix_world@v.co).z for v in me.vertices));ev.to_mesh_clear()
 for o in set(bpy.context.scene.objects)-before:o.location.z+=(y-h/2)-minimum
def water_purifier():
 # IMG_9974: independent JOVEN canister, small outlet and white connecting hose.
 # Correct rear-ledge offsets from IMG_9974; cabinet/counter/window envelopes stay fixed.
 x,z=3.74,6.837
 filterWhite=material('Refined JOVEN filter white polymer','#f8f7f3',.29)
 surface('Separate JOVEN filter moulded base',x,z,[(0,.908),(.047,.908),(.054,.914),(.055,.925),(.052,.936)],ivory,64)
 surface('Separate JOVEN white filter canister',x,z,[(0,.925),(.049,.925),(.052,.945),(.051,1.155),(.046,1.172),(0,1.172)],filterWhite,64)
 ring('Filter stainless upper collar',(x,0,z),.049,.049,1.166,.0028,steel)
 surface('Filter domed lid',x,z,[(0,1.194),(.030,1.190),(.045,1.182),(.050,1.172)],ivory,64)
 tube('Filter own thin drinking-water outlet',[(x,1.187,z),(x+.009,1.222,z),(x+.055,1.228,z-.048),(x+.076,1.200,z-.100)],.004,chrome)
 cyl('Filter small outlet aerator',(x+.076,1.198,z-.100),.005,.009,ivory)
 # White tap diverter is a separate fitting around the existing chrome base.
 cyl('Tap white filter diverter',(3.95,.993,6.845),.020,.034,ivory)
 tube('Filter flexible white inlet hose',[(3.930,1.002,6.845),(3.900,.970,6.89),(3.80,.968,6.88),(3.76,1.040,6.875),(3.74,1.171,6.885)],.0035,ivory)
 # Confirmed product lettering follows the canister's actual curved surface.
 printMat=material('Refined JOVEN product print','#686867',.70)
 for text,height,size in [('JOVEN',.977,.011),('JP200',.963,.0065)]:
  bpy.ops.object.text_add(location=xyz((x+.027,height,z-.052)));o=bpy.context.object;o.name='JOVEN filter actual product mark';o.data.body=text;o.data.size=size;o.data.extrude=.0001;o.rotation_euler=(math.pi/2,0,math.pi);o.data.materials.append(printMat);bpy.ops.object.convert(target='MESH');bpy.context.view_layer.update();matrix=o.matrix_world.copy()
  for vertex in o.data.vertices:
   p=matrix@vertex.co;dx=p.x-x;p.y=-z+math.sqrt(max(0,.052**2-dx*dx))+.00015;vertex.co=p
  o.matrix_world=Matrix.Identity(4)
def console_details():
 stitch('Blue large-eared character',2.73,.59,2.15,1.0)
 duckStart=set(bpy.context.scene.objects)
 # Orange duck riding the yellow duck, grey cap and yellow ear appliqué.
 duck=material('Refined yellow duck polymer','#f2c832',.42);orange=material('Refined orange duck polymer','#ec7424',.44)
 soft('Large seated yellow duck',(2.75,.656,2.60),(.073,.066,.085),duck,.76)
 ellipsoid('Orange duck seated torso',(2.75,.750,2.60),(.043,.065,.043),orange,.8,N=20,R=14)
 ellipsoid('Yellow duck head',(2.687,.684,2.60),(.037,.040,.038),duck,.8,N=20,R=14)
 ellipsoid('Yellow duck orange beak',(2.651,.674,2.60),(.020,.010,.024),orange,.6,N=16,R=10)
 for side in [-1,1]:ellipsoid('Yellow duck eye',(2.657,.697,2.60+side*.016),(.003,.004,.004),embroider,N=12,R=8)
 soft('Small orange duck head',(2.75,.830,2.60),(.060,.067,.059),orange,.82)
 soft('Duck grey helmet',(2.75,.870,2.60),(.063,.044,.063),grey,.75)
 for side in [-1,1]:
  soft('Duck helmet yellow stud',(2.75,.905,2.60+side*.042),(.014,.012,.013),duck)
  soft('Duck wing',(2.72,.692,2.60+side*.077),(.036,.027,.020),duck)
  eye('Orange duck eye',(2.692,.838,2.60+side*.025),.006)
 soft('Duck broad beak',(2.679,.810,2.60),(.024,.016,.029),duck,.48)
 reorient_new(duckStart,2.75,2.60,1.05)
 stitch('Pink long-eared plush',2.73,.59,2.93,.78,pink_version=True)
 # Four actual rails, recessed glazing, backing and an easel. The two original
 # photographs are missing; no invented photographs or extracted private pixels.
 physical_frame('Console owner photograph frame',2.93,.830,1.72,.48,.30,.65)
 # Reference upper display: clear acrylic egg case, a white bear jar and
 # red mushroom ornament inside its transparent round dome.
 clearCase=material('Refined clear acrylic case and dome','#edf3ee',.18)
 clearCase.diffuse_color=(*clearCase.diffuse_color[:3],.15)
 bs=clearCase.node_tree.nodes.get('Principled BSDF');bs.inputs['Alpha'].default_value=.15
 if hasattr(clearCase,'surface_render_method'):clearCase.surface_render_method='DITHERED'
 # Thin physical sheets and slim framing leave the colored contents visible.
 caseStart=set(bpy.context.scene.objects)
 for xx in [2.785,2.975]:softbox('Clear display case front and back',(xx,1.62,.91),(.002,.24,.31),clearCase,.0005)
 for zz in [.755,1.065]:softbox('Clear display case side',(2.88,1.62,zz),(.19,.24,.002),clearCase,.0005)
 softbox('Clear display case lid',(2.88,1.741,.91),(.19,.002,.31),clearCase,.0005)
 for yy in [1.5075,1.6075]:softbox('Clear display case internal support',(2.88,yy,.91),(.19,.003,.31),clearCase,.0004)
 for xx in [2.782,2.978]:
  for zz in [.753,1.067]:cord('Display case thin white corner',[(xx,1.50,zz),(xx,1.74,zz)],.002,ivory)
 eggColors=[material('Refined collectible orange polymer','#d59136',.49),material('Refined collectible yellow polymer','#e3c439',.5),material('Refined collectible green polymer','#91a443',.52)]
 for row,yy in enumerate([1.55,1.65]):
  for col,zz in enumerate([.805,.91,1.015]):ellipsoid('Display colored squishy egg',(2.83,yy,zz),(.030,.041,.033),eggColors[(row+col)%3],.86,N=20,R=14)
 for yy in [1.50,1.74]:cord('Display case orange edge',[(2.780,yy,.754),(2.780,yy,1.066)],.0025,eggColors[0])
 softbox('Clear display case physical bottom',(2.88,1.5012,.91),(.19,.0024,.31),clearCase,.0004)
 for o in set(bpy.context.scene.objects)-caseStart:o.location.z-=.0035
 # Rounded bear-shaped storage jar, not a plain white box.
 jarStart=set(bpy.context.scene.objects)
 surface('Shelf white bear jar',2.84,.637,[(0,1.50),(.044,1.50),(.056,1.52),(.057,1.63),(.049,1.66),(0,1.66)],ivory,48,.65)
 surface('Shelf bear jar lid',2.84,.637,[(0,1.681),(.041,1.679),(.057,1.664)],white,48)
 for side in [-1,1]:ellipsoid('Bear jar small ear',(2.84,1.679,.637+side*.038),(.020,.020,.017),white,N=16,R=12)
 for side in [-1,1]:ellipsoid('Bear jar black eye',(2.781,1.606,.637+side*.019),(.0015,.003,.003),embroider,N=12,R=8)
 ellipsoid('Bear jar brown nose',(2.779,1.590,.637),(.002,.005,.006),fur,N=12,R=8)
 for o in set(bpy.context.scene.objects)-jarStart:o.location.z-=.0035
 # The glass globe contains orange fish forms, not the prior mushroom.
 globeStart=set(bpy.context.scene.objects)
 cyl('Shelf globe white pedestal',(2.81,1.962,.70),.019,.078,white)
 surface('Shelf globe flared foot',2.81,.70,[(0,1.923),(.038,1.923),(.041,1.928),(.018,1.939)],ivory,40)
 for z,scale in [(.676,1),(.732,.75)]:
  fish=soft('Globe orange fish body',(2.81,2.033,z),(.026*scale,.017*scale,.011*scale),red,.86)
  fin=mesh('Globe fish forked tail',[(2.831,2.031,z),(2.854,2.047,z),(2.850,2.032,z),(2.855,2.016,z)],[(0,1,2,3)],red)
  sol=fin.modifiers.new('Fish ornament thickness','SOLIDIFY');sol.thickness=.003
  soft('Globe fish dark eye',(2.788,2.037,z-.008),(.002,.002,.001),embroider)
 ellipsoid('Clear round fish globe',(2.81,2.04,.70),(.075,.075,.075),clearCase,N=32,R=24)
 for o in set(bpy.context.scene.objects)-globeStart:o.location.z+=.0135
 physical_frame('Shelf owner photograph frame',2.95,2.1365,.91,.40,.26,.60)
 # Three-tier trolley, reconstructed from the visible reference contents.
 # Bottom: soft pink open bag with cream oval contents; silver/white zip pouch
 # lies horizontally behind it. The previous generic rolled towels are removed.
 bagPink=material('Refined pale pink trolley bag textile','#e7c3b3',.91)
 soft('Trolley bottom soft pink bag',(2.77,.237,3.33),(.105,.065,.126),bagPink,.60)
 for x,z in [(2.70,3.27),(2.79,3.27),(2.71,3.37),(2.80,3.38)]:
  soft('Trolley bag visible cream soft contents',(x,.287,z),(.036,.047,.040),ivoryFur,.82)
 tube('Trolley pink bag rim',[(2.665,.265,3.22),(2.67,.303,3.31),(2.75,.308,3.44),(2.86,.272,3.40)],.006,bagPink)
 for z in [3.24,3.40]:tube('Trolley soft bag handle',[(2.73,.26,z),(2.73,.37,z),(2.83,.37,z),(2.84,.26,z)],.005,bagPink)
 silverBag=material('Refined trolley silver pouch textile','#c6bfb7',.57)
 soft('Trolley bottom horizontal zip pouch',(2.87,.2265,3.58),(.075,.055,.098),silverBag,.42)
 tube('Trolley bottom pouch bound seam',[(2.795,.2165,3.50),(2.79,.2615,3.58),(2.80,.2165,3.67)],.0025,ivory)
 tube('Trolley bottom pouch zipper',[(2.86,.2785,3.49),(2.86,.2805,3.58),(2.86,.2785,3.67)],.0015,steel)
 box('Orange trolley supply carton',(2.81,.5015,3.42),(.15,.16,.13),material('Refined orange carton','#e7a229',.9),.003)
 for x,z,m,h in [(2.84,3.25,white,.12),(2.90,3.20,white,.10),(2.72,3.37,white,.11),(2.83,3.37,ivory,.13)]:bottle('Trolley care bottle',x,.4215,z,m,h,.022,False)
 surface('Trolley wide white blue-lid jar',2.74,3.21,[(0,.4215),(.033,.4215),(.036,.4295),(.036,.5585),(.032,.5685),(0,.5685)],white,48)
 cyl('Trolley jar blue screw lid',(2.74,.5765,3.21),.037,.025,navy)
 label_band('Trolley jar original blue label area',2.74,.4665,3.21,.0365,.043,navy)

 # Pink cup and a black pouch in the top basket.
 surface('Trolley pink cup',2.78,3.36,[(0,.672),(.039,.672),(.045,.771),(.041,.774),(.035,.681),(0,.681)],pink,48)
 soft('Trolley black fabric pouch',(2.84,.712,3.53),(.07,.040,.055),material('Refined black pouch textile','#252729',.91),.48)
 tube('Pouch attached zipper',[(2.84,.744,3.49),(2.84,.753,3.53),(2.84,.744,3.57)],.0015,grey)
 softbox('Pouch small zipper pull',(2.84,.745,3.574),(.008,.003,.012),steel,.001)

 bottle('Trolley top small pump',2.83,.672,3.20,ivory,.12,.022,True)
 # Small cream hanging character on the trolley side.
 tube('Trolley hanging cord',[(2.61,.68,3.61),(2.59,.58,3.61),(2.60,.56,3.61)],.0015,yellow)
 ellipsoid('Trolley cream face charm',(2.60,.52,3.61),(.036,.045,.038),ivoryFur,.73,N=20,R=14)
 def charmP(a,b,c):return (2.60-.60*a-.80*c,.52+b,3.61+.80*a-.60*c)
 for side in [-1,1]:
  ellipsoid('Charm dark oval eye',charmP(.037,.005,side*.012),(.004,.006,.004),embroider,N=12,R=8)
  tube('Charm embroidered eyebrow',[charmP(.038,.018,side*.018),charmP(.040,.014,side*.007)],.0015,embroider)
 tube('Charm embroidered small mouth',[charmP(.039,-.012,-.009),charmP(.041,-.007,0),charmP(.039,-.012,.009)],.0016,embroider)
 # Yellow container, lid and its small colored decoration at the fixed console.
 snackYellow=material('Refined console yellow container polymer','#edbb38',.45)
 surface('Console yellow cylindrical container',2.74,2.45,[(0,.591),(.040,.591),(.044,.604),(.046,.779),(.043,.785),(0,.785)],snackYellow,48)
 cyl('Console tub cream lid',(2.74,.792,2.45),.050,.018,ivory)
 label_band('Console container red label band',2.74,.721,2.45,.0465,.035,red)
 for side in [-1,1]:
  tube('Console lid colored paper fan rib',[(2.74,.80,2.45),(2.75,.872,2.45+side*.049)],.0015,rose)
 # Small pale mint character in front of the yellow container, separate from toys.
 soft('Console small mint ornament',(2.67,.625,2.40),(.023,.034,.023),material('Refined console mint polymer','#8bb99a',.6),.78)
 soft('Console small ornament cream face',(2.649,.643,2.40),(.005,.014,.016),ivory)
 # Reed/utensil jar at the console end, in the existing approved area.
 surface('Console reed jar',2.90,2.99,[(0,.591),(.033,.591),(.035,.71),(.031,.71),(.030,.60),(0,.60)],material('Refined smoke grey jar polymer','#797a76',.4),48)
 for i in range(6):cord('Console warm reed',[(2.90,.604,2.99),(2.89+(i%2)*.018,.83+i*.007,2.95+i*.014)],.0015,yellow)
 for i in range(3):cord('Console black handled tool',[(2.90,.604,2.99),(2.88+i*.018,.86+i*.012,2.98+i*.014)],.002,black)
 softbox('Console tall orange handled tool',(2.90,.750,2.98),(.008,.30,.022),material('Refined orange console tool polymer','#da8e35',.55),.003)
def niche_products():
 # Locked mockup: three products in one row on the WINDOW-FACING sill.
 # Fronts face -Z, not the shower rail on the perpendicular -X wall.
 ink=material('Refined niche deep navy polymer','#182c48',.31)
 gold=material('Refined niche pump collar brushed brass','#ae8d58',.34,.66)
 for i,x in enumerate([6.166,6.108]):
  y,z=1.101,6.132;h=.120 if i==0 else .112;r=.022
  surface('Niche navy pump bottle '+str(i+1),x,z,[(0,y),(.018,y),(.022,y+.008),(.023,y+.035),(.022,y+h-.05),(.018,y+h-.026),(.011,y+h-.018),(.011,y+h),(0,y+h)],ink,64)
  cyl('Niche gold pump collar',(x,y+h,z),.0125,.018,gold)
  cyl('Niche pump stem',(x,y+h+.016,z),.004,.018,black)
  softbox('Niche dark pump head',(x,y+h+.027,z-.006),(.025,.008,.013),black,.003)
  softbox('Niche pump forward spout',(x,y+h+.025,z-.018),(.009,.006,.020),black,.002)
  for j in range(4):softbox('Niche bottle fine gold print',(x,y+.042+j*.009,z-.023),(.017 if j%2 else .024,.0018,.0005),gold,.0002)
 x,z=6.051,6.120
 Y=lambda y:1.101+(y-.901)*.69
 surface('Niche white blue squeeze tube',x,z,[(r,Y(y)) for r,y in [(0,.901),((.018,.013),.901),((.023,.014),.917),((.025,.010),1.142),((.025,.004),1.160),(0,1.160)]],ivory,64,.46)
 softbox('Niche tube closed blue cap',(x,Y(.917),z),(.037,.030*.69,.029),blue,.004)
 # Printed band follows the tube surface, rather than a thick raised plaque.
 surface('Niche tube blue band',x,z,[((.0237,.0132),Y(.974)),((.0243,.0121),Y(1.034))],blue,64,.46)
 for j in range(3):softbox('Niche tube fine navy print',(x,Y(1.079+j*.012),z-.012),(.029-j*.004,.002,.001),ink,.0003)
 softbox('Niche tube red brand line',(x,Y(1.129),z-.011),(.022,.003,.001),red,.0003)
 softbox('Niche tube top crimp',(x,Y(1.157),z),(.050,.006,.007),ivory,.001)

def refined_bathroom():
 for z,m in [(4.98,green),(5.075,blue)]:bottle('Only sink bottle',6.11,.867,z,m,.16,.025,True,square=.25)
 # Diffuser and orange soap retain their fixed sill positions.
 surface('Amber reed diffuser',6.14,5.33,[(0,1.058),(.022,1.058),(.024,1.14),(.016,1.16),(0,1.16)],material('Refined amber glass','#63402c',.24),48)
 cyl('Diffuser black cap',(6.14,1.159,5.33),.016,.013,black)
 for i in range(6):cord('Diffuser black reed',[(6.14,1.16,5.33),(6.14+(i-2)*.010,1.39,5.33+(i%2)*.009)],.0012,black)
 bottle('Orange window soap',6.14,1.055,5.94,material('Refined orange soap polymer','#e58e45',.4),.14,.032,True)
 # Three triangular molded trays at exactly the retained positions/levels.
 corners=[(5.065,6.93),(5.365,6.93),(5.065,6.63)]
 for x,z in corners:
  softbox('Triangular shelf upright',(x,.47,z),(.018,.88,.018),ivory,.004)
  cyl('Triangular shelf contacting foot',(x,.025,z),.012,.020,ivory)

 for y in [.12,.46,.80]:
  o=mesh('Three-tier triangular tray',[(x,y,z) for x,z in corners],[(0,1,2)],ivory);s=o.modifiers.new('Moulded tray thickness','SOLIDIFY');s.thickness=.014;b=o.modifiers.new('Rounded tray edges','BEVEL');b.width=.006;b.segments=3
  for (x,z),(xx,zz) in zip(corners,corners[1:]+corners[:1]):tube('Triangular shelf rounded rim',[(x,y+.034,z),(xx,y+.034,zz)],.007,ivory)
 for x,z,m in [(5.27,6.90,ivory),(5.18,6.88,blue),(5.10,6.84,navy)]:bottle('Shelf care bottle',x,.801,z,m,.17,.021,True)
 bottle('Shelf amber care bottle',5.25,.461,6.90,material('Refined amber polymer','#6c431f',.45),.15,.024,True)
 surface('Shelf cream jar',5.11,6.83,[(0,.461),(.031,.461),(.033,.526),(.031,.531),(0,.531)],cream,48);cyl('Shelf jar lid',(5.11,.534,6.83),.034,.013,ivory)
 bottle('Shelf lower bottle',5.12,.121,6.85,blue,.15,.022)
 soft('Lower shelf natural bath brush',(5.22,.134,6.87),(.038,.013,.025),cream,.45)
 for i in range(7):
  for j in range(4):cord('Bath brush bristle',[(5.19+i*.009,.143,6.85+j*.012),(5.19+i*.009,.166,6.85+j*.012)],.0015,straw)
 niche_products()
 # Closed bottoms, rolled rims and hanging pivoted handles; nested teal liner.
 for x,z,m,r,h,base in [(5.94,4.75,pink,.11,.25,.016),(5.88,5.02,purple,.115,.25,.016),(5.88,5.02,teal,.10,.28,.050)]:
  surface('Moulded open bucket',x,z,[(0,base),(r*.78,base),(r*.82,base+.008),(r,h-.010),(r*1.025,h),((r*1.025)-.006,h+.003),(r-.006,h-.009),(r*.80-.006,base+.025),(0,base+.025)],m,64)
  for side in [-1,1]:soft('Bucket handle pivot',(x+side*r*.97,h-.035,z),(.008,.014,.011),ivory)
  tube('Bucket pivoted white handle',[(x-r,h-.035,z),(x-r*.75,h-.09,z-.06),(x,h-.115,z-.083),(x+r*.75,h-.09,z-.06),(x+r,h-.035,z)],.0045,ivory)
 # Loose flip-flops rest along the white wall outside the unchanged door sweep.
 # Adult-size soles and broad Y bands need more clearance than the old miniatures.
 for i,(x,z) in enumerate([(5.64,4.52),(5.63,4.62)]):
  shoeStart=set(bpy.context.scene.objects);v=[];f=[];N=48
  for y in [.016,.030]:
   for k in range(N):
    t=k*math.tau/N;rz=.120;rx=.044*(1-.15*math.cos(t));v.append((x+rx*math.sin(t)+(.004 if i else -.004)*math.cos(t),y,z+rz*math.cos(t)))
  for k in range(N):f.append((k,(k+1)%N,(k+1)%N+N,k+N))
  f.extend([tuple(range(N-1,-1,-1)),tuple(range(N,2*N))]);o=mesh('Black left/right slipper sole',v,f,rubber);b=o.modifiers.new('Soft sole edge','BEVEL');b.width=.004;b.segments=3
  # Broad moulded rubber Y bands rather than the former round cord straps.
  for side in [-1,1]:
   vv=[];ff=[];S=12
   for j in range(S+1):
    t=j/S;cx=x+side*.040*(1-t);cz=z+.012-.062*t;cy=.035+.029*t+.008*math.sin(t*math.pi);width=.009*(.85+.15*math.sin(t*math.pi))
    for u in [-1,1]:vv.append((cx+u*width*.84,cy,cz+u*width*side*.54))
   for j in range(S):a=j*2;ff.append((a,a+2,a+3,a+1))
   band=mesh('Slipper broad curved rubber strap',vv,ff,rubber);md=band.modifiers.new('Rubber strap thickness','SOLIDIFY');md.thickness=.004;be=band.modifiers.new('Soft strap edges','BEVEL');be.width=.001;be.segments=2
  cord('Slipper toe post',[(x,.030,z-.050),(x,.064,z-.050)],.0035,black)
  reorient_new(shoeStart,x,z,1.54 if i==0 else 1.62)
 # A real hanging rectangular towel with asymmetric gathered folds and sewn hem.
 v=[];uv=[];f=[];U,V=24,40
 for j in range(V+1):
  t=j/V;y=1.76-.33*t
  for i in range(U+1):
   u=i/U;w=.035+.205*(1-math.exp(-t*7));xx=5.62+(u-.5)*w+.035*t-.010*math.sin(t*4)
   yy=y-.025*math.sin(u*math.pi)*t+.012*math.sin(u*7)*t**5+.070*(.5-u)*t**3
   zz=max(4.461,4.476+.022*math.sin(u*math.pi*5+.5)*(.2+.8*t)+.016*math.sin(t*math.pi))
   v.append((xx,yy,zz));uv.append((u*1.7,t*2))
 for j in range(V):
  for i in range(U):a=j*(U+1)+i;f.append((a,a+U+1,a+U+2,a+1))
 towel=mesh('Draped blue cotton towel',v,f,material('Refined blue towel textile','#3b869d',.94),uv);s=towel.modifiers.new('Real towel thickness','SOLIDIFY');s.thickness=.003
 cord('Blue towel lower sewn hem',[v[V*(U+1)+i] for i in range(U+1)],.0015,blue)
 softbox('Towel wall hook',(5.62,1.773,4.471),(.025,.035,.022),chrome,.004)
def broom():
 x,z=2.955,3.97
 shaft=material('Refined grey broom shaft polymer','#959a98',.58)
 # One molded scoop with front lip, side lips and a real recessed pan floor.
 floor=[(x-.14,.021,z-.16),(x+.10,.040,z-.11),(x+.10,.040,z+.11),(x-.14,.021,z+.16)]
 o=mesh('Red dustpan tapered moulded scoop',floor,[(0,3,2,1)],red);s=o.modifiers.new('Moulded scoop thickness','SOLIDIFY');s.thickness=.006;b=o.modifiers.new('Pan rounded corners','BEVEL');b.width=.006;b.segments=3
 # Shallow tapered side cheeks rise only toward the rear. A dustpan must read
 # as an open floor scoop rather than a rectangular red storage box.
 for side in [-1,1]:
  wall=[(x-.14,.021,z+side*.16),(x-.14,.032,z+side*.16),(x-.045,.070,z+side*.145),(x+.10,.145,z+side*.11),(x+.10,.040,z+side*.11)]
  o=mesh('Dustpan low curved side cheek',wall,[(0,1,2,3,4)],red);s=o.modifiers.new('Dustpan wall thickness','SOLIDIFY');s.thickness=.006;b=o.modifiers.new('Dustpan rolled edge','BEVEL');b.width=.005;b.segments=3
 softbox('Dustpan rounded back',(x+.10,.092,z),(.012,.104,.22),red,.010)
 tube('Dustpan thin floor lip',[(x-.14,.019,z-.16),(x-.14,.019,z+.16)],.004,red)
 tube('Dustpan grey shaft',[(x+.10,.18,z),(x+.10,1.05,z)],.009,shaft)
 tube('Dustpan black loop grip',[(x+.10,1.01,z),(x+.10,1.10,z-.018),(x+.10,1.13,z),(x+.10,1.10,z+.018),(x+.10,1.01,z)],.006,black)
 cord('Broom straight grey handle',[(x-.04,.37,z),(3.065,1.39,z)],.0085,shaft)
 cord('Broom black upper tip',[(3.0524,1.30,z),(3.065,1.39,z)],.010,black)
 surface('Broom red ferrule',x-.039,z,[(.015,.28),(.025,.31),(.023,.39),(.012,.42)],red,40)
 # Solid straw fan supplies volume; individual fine fibres supply the silhouette.
 v=[];f=[];U,V=48,12
 for side in [-1,1]:
  for j in range(V+1):
   t=j/V;w=.026+.22*t**.75
   for i in range(U+1):
    u=i/U;xx=x-.04+(u-.5)*w;yy=.36-.330*t+.005*math.sin(u*8)*t;zz=z+side*(.006+.011*t)+.002*math.sin(u*70)
    v.append((xx,yy,zz))
 base=(U+1)*(V+1)
 for side in range(2):
  for j in range(V):
   for i in range(U):a=side*base+j*(U+1)+i;f.append((a,a+1,a+U+2,a+U+1) if side else (a,a+U+1,a+U+2,a+1))
 mesh('Dense natural straw fan',v,f,straw)
 for i in range(320):
  u=random.random();dep=random.uniform(-.017,.017);xx=x-.04+(u-.5)*.245
  cord('Individual bound straw fibre',[(x-.04+(u-.5)*.026,.36,z+dep*.25),(x-.04+(u-.5)*.12,.18,z+dep),(xx,.030+random.uniform(0,.009),z+dep)],.00065,straw)
 for yy,w in [(.275,.055),(.245,.075)]:cord('Straw binding cord',[(x-.04-w/2,yy,z-.013),(x-.04+w/2,yy,z-.013)],.0025,furLight)
def kitchen_props():
 # Original centers retained; real feet/base connect to the washer top at .875.
 for xx in [4.625,4.735]:
  for zz in [6.605,6.715]:cyl('Rice cooker contacting rubber foot',(xx,.880,zz),.010,.009,rubber)
 surface('Kettle contacting power base',4.43,6.65,[(0,.876),(.065,.876),(.072,.879),(.072,.885),(0,.885)],ivory,64)

 maroon=material('Refined rice cooker maroon trim','#7b3149',.35)
 surface('Rice cooker rounded ceramic body',4.68,6.66,[(0,.883),(.075,.883),(.093,.897),(.102,.935),(.102,1.047),(.093,1.065),(0,1.065)],ivory,64)
 ring('Rice cooker lid seam',(4.68,0,6.66),.099,.099,1.056,.003,maroon)
 surface('Rice cooker domed lid',4.68,6.66,[(0,1.089),(.055,1.087),(.091,1.076),(.102,1.066)],white,64)
 softbox('Rice cooker front control panel',(4.68,.984,6.557),(.063,.090,.006),maroon,.009)
 softbox('Rice cooker small orange selector',(4.646,.984,6.552),(.016,.075,.003),material('Refined rice cooker amber selector','#cf7e38',.4),.003)
 for yy in [.963,1.001]:soft('Rice cooker control indicator',(4.682,yy,6.551),(.010,.005,.0015),ivory)
 for x in [4.66,4.70]:softbox('Rice cooker push button',(x,.982,6.552),(.016,.025,.003),ivory,.003)
 softbox('Rice cooker latch',(4.68,1.061,6.557),(.043,.009,.012),ivory,.004)
 # The actual cooker grips are lateral. The former front grip covered its
 # maroon/orange control panel in the locked kitchen view.
 for xx in [4.575,4.785]:softbox('Rice cooker side grip',(xx,.975,6.66),(.023,.030,.070),white,.009)
 surface('Electric kettle tapered body',4.43,6.65,[(0,.885),(.063,.885),(.071,.901),(.068,1.035),(.059,1.077),(.045,1.085),(0,1.085)],white,64)
 ring('Kettle lower seam',(4.43,0,6.65),.068,.068,.906,.002,ivory)
 softbox('Kettle lid opening',(4.43,1.088,6.65),(.065,.010,.068),ivory,.006)
 tube('Kettle sculpted handle',[(4.474,.918,6.65),(4.522,.941,6.65),(4.523,1.055,6.65),(4.478,1.080,6.65)],.012,ivory)
 # Tapered rising spout with visible dark mouth.
 tube('Kettle pouring spout',[(4.378,1.019,6.65),(4.348,1.047,6.65),(4.343,1.077,6.65)],.015,white)
 soft('Kettle spout opening',(4.343,1.080,6.65),(.010,.002,.010),rubber)
 softbox('Kettle on switch',(4.43,.902,6.575),(.017,.008,.012),grey,.002)
def hanging_fish_tag():
 # Small original fish/octopus-shaped rack charm, modeled as thin relief with
 # real thickness. No reference image, substitute text or flat photo is used.
 x,z=4.19,6.466;mint=material('Refined mint fish charm polymer','#91b4a6',.55);fin=material('Refined navy fish fin','#335b71',.65);peach=material('Refined fish lip polymer','#d9b5a1',.55);octopus=material('Refined orange octopus polymer','#dc8d46',.55)
 def F(n,xx,yy,rx,ry,m,depth=.003):return soft(n,(x+xx,yy,z), (rx,ry,depth),m,.82)
 cord('Fish charm closed hanging loop',[(x,1.4855+.016*math.cos(i*math.tau/48),6.49+.016*math.sin(i*math.tau/48)) for i in range(49)],.0025,ivory)
 tube('Fish charm hanging white strap',[(x,1.4855,6.474),(x,1.395,z+.003),(x,1.364,z+.003)],.0025,ivory)
 F('Fish charm white cut edge',0,1.19,.066,.108,ivory,.004)
 for side in [-1,1]:
  F('Fish charm cut-edge foot',side*.029,1.092,.036,.026,ivory,.004)
  F('Fish charm side fin',side*.053,1.224,.018,.044,fin)
 F('Fish charm pear-shaped mint head',0,1.234,.056,.067,mint,.0045)
 F('Fish charm short mint body',0,1.134,.045,.045,mint,.0045)
 for side in [-1,1]:
  eyeX=side*.021
  soft('Fish charm huge cream eye',(x+eyeX,1.244,z-.005),(.022,.027,.0018),ivoryFur,.85)
  soft('Fish charm dark oval pupil',(x+side*.010,1.246,z-.007),(.006,.011,.0018),fin)
  F('Fish charm webbed foot',side*.025,1.095,.030,.018,mint,.005)
  tube('Fish charm small arm',[(x+side*.044,1.152,z-.002),(x+side*.051,1.122,z-.002),(x+side*.041,1.120,z-.002)],.005,mint)
 tube('Fish charm curled upper lip',[(x-.050,1.200,z-.006),(x-.019,1.195,z-.006),(x+.022,1.198,z-.006),(x+.050,1.203,z-.006)],.0035,peach)
 tube('Fish charm lower lip',[(x-.047,1.190,z-.006),(x,1.184,z-.006),(x+.045,1.193,z-.006)],.0025,peach)
 # Orange octopus companion: curved crown, four short tentacles and tiny face.
 F('Orange octopus charm crown',0,1.330,.021,.031,octopus,.006)
 for xx in [-.017,-.006,.006,.017]:F('Orange octopus charm tentacle',xx,1.310,.007,.026,octopus,.006)
 for xx in [-.005,.005]:soft('Orange octopus dark eye',(x+xx,1.338,z-.007),(.002,.004,.001),fin)
 tube('Mint fish charm short body seam',[(x-.020,1.143,z-.006),(x+.023,1.145,z-.006)],.0012,fin)

def countertop():
 hanging_fish_tag()
 # Reference black rack, correct level, thin flattened structural members.
 for x in [4.19,4.81]:
  for z in [6.49,6.90]:softbox('Black rack upright',(x,1.205,z),(.018,.65,.018),black,.004)
 for y in [.90,1.49]:
  for z in [6.49,6.90]:softbox('Black rack horizontal rail',(4.50,y,z),(.64,.018,.018),black,.004)
  for x in [4.19,4.81]:softbox('Black rack side rail',(x,y,6.695),(.018,.018,.43),black,.004)
 for x in [4.22+i*.06 for i in range(10)]:cord('Black rack dish support',[(x,1.48,6.50),(x,1.48,6.89)],.0025,black)
 # Dished plates with a real rolled rim, turned to face the kitchen camera.
 for x in [4.65,4.71]:
  o=surface('White rack dished plate',0,0,[(0,-.004),(.063,-.004),(.082,.003),(.092,.014),(.094,.019),(.090,.022),(.079,.012),(.060,.004),(0,.004)],porcelain,64)
  o.location=xyz((x,1.575,6.72));o.rotation_euler[1]=math.pi/2
 surface('White rack inverted bowl',4.37,6.70,[(.073,1.483),(.072,1.495),(.058,1.532),(.022,1.546),(0,1.546)],porcelain,64)
 # Two pale cooking tools in the original rack-mounted perforated cup.
 softbox('Rack hanging black utensil cup',(4.48,1.42,6.474),(.12,.135,.070),black,.005)
 for yy in [1.38,1.41,1.44]:
  for xx in [4.44,4.48,4.52]:softbox('Utensil cup punched slot',(xx,yy,6.436),(.012,.007,.001),rubber,.001)
 woodHandle=material('Refined pale utensil timber','#c69a5b',.7)
 for xx in [4.46,4.53]:tube('Rack wooden utensil handle',[(xx,1.358,6.47),(xx+.025,1.69,6.49)],.007,woodHandle)
 soft('Rack white ladle bowl',(4.555,1.73,6.49),(.026,.046,.013),ivory,.8)
 paddle=softbox('Rack white slotted spatula',(4.485,1.731,6.49),(.043,.081,.014),ivory,.009)
 bpy.context.view_layer.objects.active=paddle
 for md in list(paddle.modifiers):bpy.ops.object.modifier_apply(modifier=md.name)
 for xx in [4.475,4.485,4.495]:
  cut=box('Temporary actual spatula slot',(xx,1.74,6.49),(.003,.040,.050),ivory,.001);bpy.context.view_layer.objects.active=cut
  for md in list(cut.modifiers):bpy.ops.object.modifier_apply(modifier=md.name)
  bpy.context.view_layer.objects.active=paddle;md=paddle.modifiers.new('Real open utensil slot','BOOLEAN');md.operation='DIFFERENCE';md.solver='EXACT';md.object=cut;bpy.ops.object.modifier_apply(modifier=md.name);bpy.data.objects.remove(cut,do_unlink=True)
 paddle.modifiers.new('Slotted utensil weighted normals','WEIGHTED_NORMAL')
 surface('Pale utensil crock',4.18,6.84,[(0,.908),(.047,.908),(.050,1.077),(.046,1.081),(.042,1.074),(.041,.919),(0,.919)],ivory,64)
 for x,m in [(4.16,blue),(4.20,white)]:
  cord('Long sink utensil shaft',[(x,.919,6.84),(x,1.33,6.84)],.0035,steel)
  soft('Blue and white sink utensil head',(x,1.35,6.84),(.015,.033,.009),m,.62)
  if m==blue:
   for i in range(7):cord('Blue brush bristle',[(x-.012+i*.004,1.32,6.831),(x-.012+i*.004,1.379,6.831)],.0017,blue)
 pale=material('Refined pale beige shelf timber','#cfb98f',.65)
 softbox('Pale beige shelf',(3.48,1.075,6.80),(.36,.020,.18),pale,.004)
 for x in [3.31,3.65]:softbox('White beige-shelf leg',(x,.9925,6.80),(.018,.17,.18),ivory,.003)
 amber=material('Refined condiment amber glass','#8e5219',.23)
 # The reviewed camera looks toward +Z, so larger world X projects left.
 soy=material('Refined dark soy glass','#33291b',.23)
 for x,m,h in [(3.59,amber,.22),(3.48,material('Refined oil glass','#c69b23',.24),.23),(3.36,soy,.19)]:
  surface('Shelf condiment bottle',x,6.83,[(0,1.085),(.024,1.085),(.026,1.10),(.024,1.085+h*.68),(.013,1.085+h*.85),(.011,1.085+h),(0,1.085+h)],m,48)
  cyl('Shelf condiment cap',(x,1.085+h,6.83),.013,.026,red if x==3.59 else yellow)
  softbox('Condiment label',(x,1.085+h*.43,6.804),(.034,h*.28,.001),red if x==3.59 else black if x==3.36 else m,.001)
 # Preserve the actual photographed artwork, with open interior and real handles.
 mugBefore=set(bpy.context.scene.objects);A.mug(3.40,6.73);A.mug(3.56,6.73)
 for obj in set(bpy.context.scene.objects)-mugBefore:obj.location.z-=.0154
 for xx in [3.40,3.56]:cyl('Mug closed ceramic foot',(xx,.9081,6.73),.029,.001,A.blue)

 bottle('Green sink soap',3.88,.908,6.83,green,.13,.025,True)
 # Drying cloth supported entirely by the front stone strip, beside the
 # basin rim (cloth ends X=3.630; basin begins X=3.645). The front hem folds over the eased edge.
 v=[];uv=[];f=[];U,V=32,48
 for j in range(V+1):
  t=j/V
  for i in range(U+1):
   u=i/U;xx=3.29+u*.34
   if t<.10:
    a=t/.10;zz=6.307;yy=.897+.0065*a+.0012*(1-a)*math.sin(u*math.pi*4)
   elif t<.30:
    # Stone edge radius 4 mm; outer fabric radius 7 mm leaves 1 mm
    # inner clearance after its actual 2 mm solidified thickness.
    a=(t-.10)/.20*math.pi/2;zz=6.314-.007*math.cos(a);yy=.9035+.007*math.sin(a)
   else:
    a=(t-.30)/.70;zz=6.314+.196*a
    yy=.9097+.0017*(.5+.5*math.sin(u*19+a*8))+.0008*(.5+.5*math.sin(a*22))
   v.append((xx,yy,zz));uv.append((u*2,t*1.3))
 for j in range(V):
  for i in range(U):a=j*(U+1)+i;f.append((a,a+U+1,a+U+2,a+1))
 o=mesh('Grey woven drying cloth',v,f,material('Refined grey drying textile','#74777d',.91),uv);md=o.modifiers.new('Textile thickness','SOLIDIFY');md.thickness=.002;md.offset=-1
 for row in [0,V]:cord('Drying cloth bound hem',[v[row*(U+1)+i] for i in range(U+1)],.0011,greyFur)
 for col in [0,U]:cord('Drying cloth stitched side',[v[j*(U+1)+col] for j in range(V+1)],.0007,greyFur)
 # Shallow handled cooking pot and tall white electric saucepan, distinct forms.
 x,r,h=3.13,.115,.12
 surface('Cream shallow cooking pot',x,6.66,[(0,.999),(.072,.999),(.098,1.014),(.115,1.10),(.115,1.12),(.108,1.128),(0,1.128)],ivory,72)
 surface('Cooking pot domed lid',x,6.66,[(0,1.153),(.046,1.150),(.102,1.134),(.115,1.127)],white,64)
 ring('Cooking pot dark lid seam',(x,0,6.66),r,r,1.129,.0025,black)
 tube('Cooking pot pale raised lid grip',[(3.105,1.149,6.66),(3.105,1.179,6.66),(3.155,1.179,6.66),(3.155,1.149,6.66)],.009,ivory)
 tube('Cooking pot long handle',[(3.035,1.080,6.66),(2.955,1.095,6.66),(2.890,1.091,6.66)],.016,ivory)
 softbox('Cooking pot handle collar',(3.026,1.083,6.66),(.021,.032,.035),steel,.006)
 x=2.76
 surface('Electric saucepan tall body',x,6.66,[(0,1.00),(.060,1.00),(.074,1.02),(.075,1.18),(.072,1.20),(0,1.20)],white,64)
 surface('Electric saucepan lid',x,6.66,[(0,1.212),(.061,1.210),(.076,1.201)],ivory,64)
 ring('Electric saucepan lid seam',(x,0,6.66),.075,.075,1.20,.002,grey)
 softbox('Electric saucepan lid grip',(x,1.223,6.66),(.036,.018,.020),ivory,.007)
 tube('Electric saucepan vertical handle',[(2.692,1.175,6.66),(2.636,1.17,6.66),(2.635,1.05,6.66),(2.695,1.05,6.66)],.011,ivory)
 knob=disk_front('Electric saucepan round control',(2.76,1.049,6.581),.018,.009,ivory)
 cord('Electric saucepan knob index',[(2.76,1.050,6.575),(2.76,1.062,6.575)],.0015,grey)
 tube('Electric pot power cable',[(2.70,1.025,6.73),(2.60,.940,6.84),(2.60,.932,6.52),(2.64,.931,6.40)],.003,black)

group('Kitchen washer appliances',kitchen_props);group('Kitchen simplified countertop',countertop)
group('Kitchen separate water purifier',water_purifier)
group('Kitchen separated mesh bin',A.bin_mesh);group('Bathroom approved accessories',refined_bathroom)
group('Hallway broom and red dustpan',broom);group('Hallway visible sofa plush',plush);group('Hallway visible console and trolley details',console_details)
export('final-room-props.glb')
