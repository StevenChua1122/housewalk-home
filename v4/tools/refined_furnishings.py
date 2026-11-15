"""Refine furniture/fixtures at PR #8's locked anchors and footprints, in Blender."""
import bpy,sys,math,os
from pathlib import Path
from mathutils import Vector
sys.path.insert(0,str(Path(__file__).resolve().parent))
from refinement_common import *
cabinet=material('Refined grey linen cabinet laminate','#aaa69f',.70)
counter=material('Refined black stone countertop','#191d1e',.31)
graphite=material('Refined refrigerator graphite casing','#444c50',.39,.45)
fridgeSteel=material('Refined refrigerator brushed stainless','#a7acae',.30,.90)
enamel=material('Refined white cabinet lacquer','#f1efe8',.35)
darkWood=material('Refined dark dining timber','#342c26',.44)
oakTop=material('Refined console oak timber','#a68d6c',.52)
creamSeat=material('Refined cream dining seat textile','#e2d6c1',.92)
lens=material('Refined warm fixture lens','#f9eee1',.45)
bs=lens.node_tree.nodes.get('Principled BSDF');bs.inputs['Emission Color'].default_value=(1,.70,.40,1);bs.inputs['Emission Strength'].default_value=1.1
smokedGlass=material('Refined washer convex smoked glass','#11191d',.12,.05)
def between(name,a,b,r,m,segments=32):
 av,bv=Vector(xyz(a)),Vector(xyz(b));v=bv-av
 bpy.ops.mesh.primitive_cylinder_add(vertices=segments,radius=r,depth=v.length,location=(av+bv)/2);o=bpy.context.object;o.name=name;o.rotation_euler=v.to_track_quat('Z','Y').to_euler();o.data.materials.append(m)
 for p in o.data.polygons:p.use_smooth=len(p.vertices)==4
 return o
def ring_z(name,x,y,z,outer,inner,depth,m,N=96):
 v=[];f=[]
 for r,zz in [(outer,z+depth/2),(outer,z-depth/2),(inner,z-depth/2),(inner,z+depth/2)]:
  for i in range(N):a=i*math.tau/N;v.append((x+r*math.cos(a),y+r*math.sin(a),zz))
 for j in range(4):
  for i in range(N):a=j*N+i;b=j*N+(i+1)%N;c=((j+1)%4)*N+(i+1)%N;d=((j+1)%4)*N+i;f.append((a,d,c,b))
 o=mesh(name,v,f,m);be=o.modifiers.new('Rolled ring bevel','BEVEL');be.width=.0025;be.segments=3;return o
def countertop_slab():
 o=box('Black stone slab with genuine basin cutout',(3.4175,.885,6.65),(1.655,.045,.68),counter,0)
 cut=box('Temporary sink cutter',(3.92,.885,6.67),(.53,.30,.41),counter,.018)
 bpy.context.view_layer.objects.active=cut
 for md in list(cut.modifiers):bpy.ops.object.modifier_apply(modifier=md.name)
 bpy.context.view_layer.objects.active=o;mod=o.modifiers.new('Open sink cavity','BOOLEAN');mod.operation='DIFFERENCE';mod.solver='EXACT';mod.object=cut;bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cut,do_unlink=True)
 be=o.modifiers.new('Stone eased edges','BEVEL');be.width=.004;be.segments=3;norm=o.modifiers.new('Stone weighted normals','WEIGHTED_NORMAL');norm.keep_sharp=True
def kitchen():
 # Existing run, appliance anchors, upper-door centers, frame opening and floor
 # positions are unchanged. Only surface/edge/appliance geometry is refined.
 softbox('Kitchen floor-standing plinth',(3.415,.095,6.69),(1.65,.16,.53),ivory,.007)
 carcass=box('Kitchen base cabinet carcass',(3.415,.47625,6.69),(1.65,.7725,.58),cabinet,0)
 cut=box('Temporary carcass sink clearance',(3.92,.83,6.67),(.56,.50,.44),cabinet,.015)
 bpy.context.view_layer.objects.active=cut
 for md in list(cut.modifiers):bpy.ops.object.modifier_apply(modifier=md.name)
 bpy.context.view_layer.objects.active=carcass;md=carcass.modifiers.new('Real drop-in sink clearance','BOOLEAN');md.operation='DIFFERENCE';md.solver='EXACT';md.object=cut;bpy.ops.object.modifier_apply(modifier=md.name);bpy.data.objects.remove(cut,do_unlink=True)
 be=carcass.modifiers.new('Carcass manufactured edges','BEVEL');be.width=.005;be.segments=3;carcass.modifiers.new('Carcass weighted normals','WEIGHTED_NORMAL')

 for x in [2.7555,3.0865,3.4175,3.7485,4.0795]:
  softbox('Grey linen lower cabinet door',(x,.49,6.35),(.323,.68,.027),cabinet,.003)
  softbox('Lower cabinet recessed finger pull',(x,.836,6.353),(.300,.012,.024),black,.002)
 countertop_slab()
 surface('Open brushed stainless sink basin',3.92,6.67,[((.215,.150),.74),((.245,.18),.795),((.263,.203),.909),((.275,.215),.913),((.260,.200),.917),((.244,.184),.903),((.227,.168),.778),((.202,.142),.754),((.05,.05),.745),(0,.745)],steel,96,.31)
 cyl('Sink drain strainer',(3.92,.748,6.67),.029,.005,chrome)
 for i in range(9):
  a=i*math.tau/9;cyl('Sink drain holes',(3.92+.018*math.cos(a),.752,6.67+.018*math.sin(a)),.002,.001,black)
 cyl('Gooseneck mixer base',(3.95,.94,6.90),.025,.055,chrome)
 tube('Continuous curved gooseneck faucet',[(3.95,.96,6.90),(3.95,1.16,6.90),(3.95,1.285,6.81),(3.95,1.17,6.65)],.013,chrome)
 cyl('Faucet aerator',(3.95,1.158,6.65),.016,.025,chrome)
 between('Mixer side valve connection',(3.970,.945,6.90),(4.015,.945,6.90),.013,chrome,32)
 tube('Mixer side lever',[(4.015,.94,6.90),(4.025,1.015,6.90),(4.025,1.025,6.87)],.006,chrome)
 # Five white doors; no extra white door is created above the refrigerator.
 softbox('Continuous white upper carcass',(3.735,2.16,6.83),(2.28,.78,.32),enamel,.003)
 for i,x in enumerate([2.82,3.28,3.74,4.20,4.66]):
  softbox('White upper cabinet door '+str(i+1),(x,2.16,6.653),(.448,.775,.025),enamel,.003)
 softbox('Upper underside shadow reveal',(3.735,1.765,6.67),(2.23,.009,.018),ivory,.002)
 # Backsplash tiles remain interrupted by the fixed window aperture.
 backsplash=material('Refined pale backsplash tile','#d7d4ca',.48)
 for x in [2.65+i*.105 for i in range(22)]:
  for y in [1.00+i*.105 for i in range(8)]:
   if x>3.44 and x<4.43 and y>1.02 and y<1.75:continue
   if x>4.85:continue
   softbox('Kitchen backsplash tile',(x,y,6.977),(.101,.101,.017),backsplash,.002)
 # Embossed foil tile finish behind hob: geometry and normals, not a photograph.
 foil=material('Refined silver heat backsplash','#b5b8b7',.36,.72)
 for x in [2.65+i*.105 for i in range(7)]:
  for y in [1.00+i*.105 for i in range(7)]:
   softbox('Hob foil relief square',(x,y,6.962),(.101,.101,.008),foil,.003)
   # Embossed diamonds catch real environment highlights on the retained tile grid.
   for a,b in [((-.043,0),(0,.043)),((0,.043),(.043,0)),((.043,0),(0,-.043)),((0,-.043),(-.043,0))]:
    between('Foil diamond pressed ridge',(x+a[0],y+a[1],6.956),(x+b[0],y+b[1],6.956),.0018,foil,8)
 for x in [3.47,4.37]:softbox('Black kitchen window outer jamb',(x,1.385,6.94),(.042,.71,.09),black,.004)
 for y in [1.05,1.72]:softbox('Black kitchen window outer rail',(3.92,y,6.94),(.94,.042,.09),black,.004)
 for x in [3.501,4.339]:softbox('Window rubber glazing gasket',(x,1.385,6.929),(.007,.625,.013),rubber,.002)
 for y in [1.081,1.689]:softbox('Window rubber glazing gasket',(3.92,y,6.929),(.837,.007,.013),rubber,.002)
 softbox('Window sliding catch',(3.50,1.32,6.89),(.018,.105,.018),chrome,.004)
 # Insert hood housing mounts inside the upper carcass. Canopy meets its underside.
 softbox('Hood concealed mounting body',(2.95,1.81,6.79),(.61,.11,.28),steel,.009)
 softbox('Hood rolled steel canopy',(2.95,1.755,6.67),(.67,.05,.49),steel,.009)
 softbox('Hood lower filter surround',(2.95,1.724,6.68),(.55,.012,.33),black,.003)
 for x in [2.70+i*.023 for i in range(22)]:softbox('Hood fine grease filter',(x,1.715,6.68),(.006,.006,.28),steel,.001)
 for x in [2.80,2.85,2.90,2.95,3.0]:
  o=disk_front('Hood push-button',(x,1.752,6.413),.005,.006,black)
 for x in [2.72,3.18]:cyl('Hood recessed warm task light',(x,1.723,6.52),.020,.008,lens)
 softbox('Two-burner brushed gas hob',(2.95,.924,6.66),(.65,.018,.46),steel,.007)
 for x in [2.76,3.13]:
  cyl('Hob burner collar',(x,.946,6.66),.078,.027,black)
  cyl('Hob burner crown',(x,.965,6.66),.052,.014,steel)
  cyl('Hob dark burner cap',(x,.977,6.66),.047,.012,black)
  for k in range(4):
   a=k*math.pi/2;between('Cast iron pan support',(x+.04*math.cos(a),.995,6.66+.04*math.sin(a)),(x+.145*math.cos(a),.984,6.66+.145*math.sin(a)),.008,black,16)
 for x in [2.85,3.01]:
  softbox('Hob polished control knob',(x,.954,6.46),(.036,.025,.035),chrome,.006)
  softbox('Hob knob index',(x,.968,6.457),(.003,.0015,.020),black,.0005)
 # Refrigerator and its ceiling-height surround, at the unchanged footprint.
 softbox('Graphite refrigerator shell',(2.15,1.09,6.66),(.76,2.12,.68),graphite,.023)
 for y,h in [(.69,1.28),(1.75,.76)]:softbox('Brushed stainless refrigerator door',(2.15,y,6.297),(.72,h,.045),fridgeSteel,.018)
 softbox('Refrigerator recessed grip shadow',(2.15,1.35,6.280),(.65,.023,.020),rubber,.005)
 softbox('Refrigerator grip upper edge',(2.15,1.365,6.269),(.62,.008,.014),steel,.003)
 for x in [1.84,2.46]:
  for z in [6.40,6.91]:cyl('Refrigerator foot',(x,.034,z),.025,.038,rubber)
 softbox('Grey refrigerator overhead cabinet',(2.15,2.465,6.70),(.80,.60,.58),cabinet,.005)
 softbox('Grey overhead cupboard front',(2.15,2.465,6.385),(.76,.56,.025),cabinet,.004)
 for x in [1.752,2.553]:softbox('Fridge surround upright',(x,1.385,6.66),(.032,2.77,.76),cabinet,.003)
 # Front-loading washer: actual opening, gasket, convex glass and inset controls.
 body=box('Washer formed enamel case',(4.55,.445,6.66),(.61,.86,.62),white,0)
 bpy.ops.mesh.primitive_cylinder_add(vertices=96,radius=.225,depth=.30,location=xyz((4.55,.40,6.38)));cut=bpy.context.object;cut.rotation_euler[0]=math.pi/2
 bpy.context.view_layer.objects.active=body;mod=body.modifiers.new('Actual washer drum recess','BOOLEAN');mod.operation='DIFFERENCE';mod.solver='EXACT';mod.object=cut;bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cut,do_unlink=True)
 be=body.modifiers.new('Washer formed edge radii','BEVEL');be.width=.013;be.segments=4;wn=body.modifiers.new('Washer body weighted normals','WEIGHTED_NORMAL');wn.keep_sharp=True
 ring_z('Washer broad moulded door ring',4.55,.40,6.328,.249,.228,.044,ivory)
 ring_z('Washer black flexible gasket',4.55,.40,6.298,.231,.214,.025,rubber)
 ring_z('Washer polished inner rim',4.55,.40,6.279,.216,.210,.012,steel)
 disk_front('Washer steel drum back',(4.55,.40,6.51),.211,.008,steel)
 for k in range(72):
  a=k*math.tau/72;r=.12+(k%2)*.03;disk_front('Drum perforation',(4.55+r*math.cos(a),.40+r*math.sin(a),6.502),.0025,.001,rubber)
 # Convex cap creates a real reflection gradient over the black glass.
 v=[];uv=[];f=[];N,R=96,16
 for j in range(R+1):
  r=.210*j/R
  for i in range(N+1):
   a=i*math.tau/N;v.append((4.55+r*math.cos(a),.40+r*math.sin(a),6.279-.022*(1-(r/.210)**2)));uv.append((.5+.5*math.cos(a)*j/R,.5+.5*math.sin(a)*j/R))
 for j in range(R):
  for i in range(N):a=j*(N+1)+i;f.append((a,a+1,a+N+2,a+N+1))
 mesh('Washer convex smoked glass',v,f,smokedGlass,uv)
 softbox('Washer upper control fascia',(4.55,.77,6.332),(.566,.145,.020),ivory,.006)
 softbox('Washer detergent drawer',(4.42,.78,6.317),(.18,.062,.010),white,.004)
 softbox('Washer drawer finger recess',(4.42,.750,6.309),(.14,.007,.009),grey,.002)
 disk_front('Washer flat program selector',(4.69,.77,6.307),.024,.012,steel)
 softbox('Washer display',(4.56,.77,6.316),(.073,.028,.008),black,.002)
 for x in [4.54,4.58]:softbox('Washer small control button',(x,.738,6.310),(.017,.009,.005),white,.002)
 softbox('Washer door recessed pull',(4.739,.40,6.296),(.027,.094,.016),rubber,.009)
 softbox('Washer lower service hatch',(4.36,.106,6.344),(.087,.096,.007),ivory,.008)
 for x in [4.29,4.81]:
  for z in [6.42,6.90]:cyl('Washer rubber foot',(x,.025,z),.019,.020,rubber)
 # Retain the original kitchen ceiling disk and switch positions.
 cyl('Kitchen ceiling mounting backplate',(3.58,2.755,5.70),.098,.026,white)
 cyl('Kitchen white ceiling disk',(3.58,2.735,5.70),.115,.025,white);cyl('Kitchen opal lens',(3.58,2.718,5.70),.092,.010,lens)
 for x in [4.91,5.00]:softbox('Kitchen wall switch',(x,1.45,6.974),(.065,.10,.015),ivory,.004)
def console_shelf_trolley():
 # Same console anchor and dimensions; open warm-oak cubbies replace flat lines.
 softbox('TV console standing plinth',(2.82,.034,2.10),(.44,.038,1.94),ivory,.004)
 softbox('TV console oak top',(2.82,.565,2.10),(.475,.050,2.04),oakTop,.008)
 softbox('TV console outer back',(3.018,.295,2.10),(.025,.49,1.98),ivory,.003)
 for z in [1.11,1.60,2.10,2.60,3.09]:softbox('TV console vertical divider',(2.815,.294,z),(.419,.49,.022),ivory,.003)
 softbox('TV console lower shelf',(2.815,.078,2.10),(.42,.026,1.98),oakTop,.004)
 # Alternating white doors and open shelving reflect the approved long cabinet.
 for z in [1.355,2.355]:softbox('TV console ivory door',(2.590,.309,z),(.022,.43,.462),ivory,.004)
 for z in [1.85,2.85]:softbox('TV console oak cubby shelf',(2.81,.296,z),(.40,.018,.465),oakTop,.003)
 for yy in [1.42,1.82]:
  for zz in [2.20,2.80]:softbox('TV bracket contacting wall spacer',(3.065,yy,zz),(.020,.050,.050),black,.003)
 # Original empty mounting bracket, with slotted vertical arms and black bolts.
 for y in [1.42,1.82]:softbox('Empty TV bracket horizontal rail',(3.025,y,2.50),(.062,.061,.97),black,.004)
 for z in [2.05,2.95]:
  softbox('TV bracket slotted vertical arm',(2.985,1.64,z),(.065,.65,.067),black,.004)
  for y in [1.46,1.58,1.71,1.84]:
   o=cyl('TV bracket mounting bolt',(2.946,y,z),.005,.004,steel);o.rotation_euler[1]=math.pi/2
 # White five-tier shelf preserves its exact footprint and occupied upper levels.
 for x in [2.615,3.065]:
  for z in [.55,1.09]:softbox('White shelf square upright',(x,1.00,z),(.020,1.98,.024),ivory,.005)
 for y in [.16,.60,1.04,1.48,1.92]:softbox('White shelf thin tier',(2.84,y,.82),(.45,.033,.56),white,.006)
 # Three open mesh baskets, real rounded rails and castor forks.
 x,z=2.81,3.43
 for xx in [x-.18,x+.18]:
  for zz in [z-.27,z+.27]:
   between('Trolley slim upright',(xx,.08,zz),(xx,.81,zz),.009,white,16)
   softbox('Trolley castor fork',(xx,.080,zz),(.022,.043,.038),steel,.004)
   o=disk_front('Trolley black castor',(xx,.052,zz),.035,.026,rubber)
   o.rotation_euler[1]=.16
 for y in [.17,.42,.67]:
  for xx in [x-.19,x+.19]:
   for yy in [y+.004,y+.085]:between('Trolley basket open long rim',(xx,yy,z-.29),(xx,yy,z+.29),.0035,ivory,12)
   for zz in [z-.27+i*.036 for i in range(16)]:between('Trolley basket vertical side wire',(xx,y+.006,zz),(xx,y+.083,zz),.0018,white,8)
  for zz in [z-.29,z+.29]:
   for yy in [y+.004,y+.085]:between('Trolley basket open end rim',(x-.19,yy,zz),(x+.19,yy,zz),.0035,ivory,12)
   for xx in [x-.17+i*.034 for i in range(11)]:between('Trolley basket vertical end wire',(xx,y+.006,zz),(xx,y+.083,zz),.0018,white,8)
  for xx in [x-.17+i*.035 for i in range(11)]:between('Trolley open wire mesh',(xx,y,z-.27),(xx,y,z+.27),.0015,white,6)
  for zz in [z-.27+i*.035 for i in range(16)]:between('Trolley open wire mesh',(x-.18,y,zz),(x+.18,y,zz),.0015,white,6)
 for zz in [z-.27,z+.27]:tube('Trolley rounded push handle',[(x-.18,.78,zz),(x-.18,.86,zz),(x+.18,.86,zz),(x+.18,.78,zz)],.009,white)
def wall_clock_and_controls():
 # The fixed west face of the living partition carries the photographed clock
 # and white controls; these are decorative/fixture details, not new openings.
 for x,r,depth,m in [(3.070,.112,.010,ivory),(3.053,.115,.026,ivory),(3.037,.102,.005,white)]:
  o=cyl('White hallway wall clock',(x,2.12,3.98),r,depth,m);o.rotation_euler[1]=math.pi/2
 for i in range(12):
  a=i*math.tau/12;y=2.12+.084*math.cos(a);z=3.98+.084*math.sin(a)
  between('Clock raised hour index',(3.032,2.12+.079*math.cos(a),3.98+.079*math.sin(a)),(3.032,2.12+.090*math.cos(a),3.98+.090*math.sin(a)),.0012,grey,8)
 between('Clock minute hand',(3.028,2.12,3.98),(3.028,2.12+.076*math.cos(.9),3.98+.076*math.sin(.9)),.0016,black,8)
 between('Clock hour hand',(3.025,2.12,3.98),(3.025,2.12+.050*math.cos(-1.0),3.98+.050*math.sin(-1.0)),.0024,black,8)
 for yy,h in [(1.68,.18),(1.84,.10)]:softbox('White hallway wall control plate',(3.061,yy,3.35),(.026,h,.10),ivory,.004)
 softbox('Hallway thermostat grey display',(3.045,1.85,3.35),(.004,.050,.058),grey,.001)
 for z in [3.326,3.374]:softbox('Hallway white rocker switch',(3.044,1.68,z),(.008,.115,.038),white,.003)

def dining():
 # Original transformed table/chair coordinates, no composition-driven movement.
 softbox('Black rectangular dining table top',(.90,.755,4.20),(1.65,.065,.86),darkWood,.012)
 softbox('Dining table apron',(.90,.680,4.20),(1.5094,.085,.70),darkWood,.005)
 for x in [.15,1.65]:
  for z in [3.85,4.55]:softbox('Dining table grounded leg',(x,.3675,z),(.052,.705,.055),darkWood,.006)
 for x in [.459375,1.25625]:
  for z,side in [(3.57,-1),(4.83,1)]:
   back=z+side*.205;front=z-side*.19
   for xx in [x-.178125,x+.178125]:
    softbox('Dining chair rear leg and stile',(xx,.4775,back),(.040,.925,.045),darkWood,.006)
    between('Dining chair front leg',(xx,.015,front),(xx,.43,front-side*.025),.019,darkWood,20)
    between('Dining chair side stretcher',(xx,.22,front),(xx,.22,back),.010,darkWood,16)
   softbox('Dining chair seat frame',(x,.405,z),(.43125,.055,.45),darkWood,.005)
   ellipsoid('Dining chair cream upholstered seat',(x,.468,z),(.21094,.050,.215),creamSeat,.25,N=40,R=16)
   # Curved ladder rails with eased timber corners, never a generic chair type.
   for y in [.66,.79,.91]:
    rail=softbox('Dining chair ladder back rail',(x,y,back),(.35625,.055,.045),darkWood,.010)
def lights_and_fan():
 # Retain the existing light/fan/light sequence and the three track heads.
 for x,z in [(1.70,3.49),(1.70,1.39),(2.22,.48)]:
  surface('Black cylindrical downlight',x,z,[(0,2.770),(.071,2.770),(.074,2.758),(.074,2.670),(.066,2.660),(.058,2.665)],black,64)
  cyl('Recessed warm downlight lens',(x,2.669,z),.057,.009,lens)
 # Refined AC enclosure stays on the same support plane and footprint.
 softbox('Living AC casing',(.64,2.34,1.10),(.83,.32,.24),ivory,.025)
 softbox('Living AC dark air slit',(.64,2.205,1.229),(.75,.028,.011),black,.003)
 for y in [2.191,2.200,2.209]:softbox('Living AC individual louvre',(.64,y,1.236),(.73,.003,.014),ivory,.001)
 softbox('Living AC front panel seam',(.64,2.31,1.224),(.69,.006,.003),grey,.001)
 indicator=material('Refined AC green indicator','#87b689',.6)
 o=disk_front('Living AC tiny status lens',(.96,2.34,1.227),.003,.002,indicator)
 cyl('Fan ceiling rose',(1.70,2.722,2.42),.076,.09,black)
 between('Fan suspension stem',(1.70,2.68,2.42),(1.70,2.56,2.42),.023,black)
 surface('Fan smooth motor housing',1.70,2.42,[(0,2.50),(.07,2.505),(.125,2.535),(.142,2.56),(.12,2.60),(.075,2.615),(0,2.615)],black,64)
 cyl('Fan lower opal center',(1.70,2.497,2.42),.050,.009,lens)
 for k in range(3):
  v=[];uv=[];f=[];U,V=8,36;angle=k*math.tau/3+.20
  for j in range(V+1):
   t=j/V;r=.10+.56*t;width=(.035+.065*math.sin(math.pi*t*.9)**.7)*(1-.60*t**7)
   for i in range(U+1):
    u=i/U-.5;tang=u*width*1.5+.020*math.sin(t*math.pi)
    xx=1.70+math.cos(angle)*r-math.sin(angle)*tang;zz=2.42+math.sin(angle)*r+math.cos(angle)*tang
    yy=2.505-.014*t+.006*(1-(u*2)**2)*math.sin(t*math.pi)+u*.018*t
    v.append((xx,yy,zz));uv.append((i/U,t))
  for j in range(V):
   for i in range(U):a=j*(U+1)+i;f.append((a,a+1,a+U+2,a+U+1))
  o=mesh('Fan solid tapered airfoil blade',v,f,black,uv);s=o.modifiers.new('Real fan blade thickness','SOLIDIFY');s.thickness=.003;b=o.modifiers.new('Soft blade edge','BEVEL');b.width=.0015;b.segments=2
 softbox('Black dining horizontal track',(.928125,2.720,4.24),(1.74375,.034,.040),black,.004)
 softbox('Black dining return track',(1.78125,2.720,4.56),(.0375,.034,.68),black,.004)
 for px,pz in [(.496875,4.24),(1.3125,4.24),(1.78125,4.72)]:softbox('Track contacting ceiling clip',(px,2.7525,pz),(.035,.031,.035),black,.003)
 for sx,sz,tx,tz in [(.496875,4.24,.61,3.45),(1.3125,4.24,1.09,3.45),(1.78125,4.72,.94,3.51)]:
  mount=Vector((sx,2.63,sz));direction=Vector((tx-sx,-1.8,tz-sz)).normalized();end=mount+direction*.18
  between('Track spotlight suspension',(sx,2.72,sz),mount,.013,black,24)
  between('Track spotlight swivel',mount,mount+direction*.05,.032,black,32)
  between('Track spotlight closed cylinder',mount+direction*.04,end,.048,black,48)
  between('Track spotlight recessed lens',end-direction*.004,end+direction*.003,.041,lens,48)
def football():
 greenPanel=material('Refined football green panels','#1d604b',.66)
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1);base=bpy.context.object;verts=[v.co.copy() for v in base.data.vertices];faces=[list(p.vertices) for p in base.data.polygons];bpy.data.objects.remove(base,do_unlink=True)
 edges=set()
 for face in faces:
  for i in range(3):edges.add((face[i],face[(i+1)%3]));edges.add((face[(i+1)%3],face[i]))
 keys=sorted(edges);pts=[((verts[a]*2+verts[b])/3).normalized() for a,b in keys];idx={e:i for i,e in enumerate(keys)};polys=[];mats=[]
 for i,p in enumerate(verts):
  neighbors=[k for k in keys if k[0]==i];normal=p.normalized();axis=normal.cross(Vector((0,0,1)))
  if axis.length<.1:axis=normal.cross(Vector((0,1,0)))
  axis.normalize();other=normal.cross(axis);neighbors.sort(key=lambda e:math.atan2(pts[idx[e]].dot(other),pts[idx[e]].dot(axis)))
  polys.append([idx[e] for e in neighbors]);mats.append(1)
 for a,b,c in faces:polys.append([idx[(a,b)],idx[(b,a)],idx[(b,c)],idx[(c,b)],idx[(c,a)],idx[(a,c)]]);mats.append(0)
 vv=[(2.48+p.x*.10,.115+p.z*.10,1.12-p.y*.10) for p in pts]
 for i,poly in enumerate(polys):
  a,b,c=[Vector(xyz(vv[n])) for n in poly[:3]];center=sum((Vector(xyz(vv[n])) for n in poly),Vector())/len(poly);origin=Vector(xyz((2.48,.115,1.12)))
  if (b-a).cross(c-a).dot(center-origin)<0:polys[i]=list(reversed(poly))
 o=mesh('Green and ivory football',vv,polys,ivory);o.data.materials.append(greenPanel)
 for p,m in zip(o.data.polygons,mats):p.material_index=m;p.use_smooth=False
 be=o.modifiers.new('Football stitched panel seams','BEVEL');be.width=.001;be.segments=2

if os.environ.get('HW_FURNISHINGS_ONLY')!='hallway':
 group('Kitchen fixed cabinetry and appliances',kitchen);export('kitchen-refined.glb');clear()
if os.environ.get('HW_FURNISHINGS_ONLY')!='kitchen':
 group('Hallway fixed console shelf trolley',console_shelf_trolley);group('Hallway fixed dining set',dining);group('Hallway fixed lights and fan',lights_and_fan);group('Hallway wall clock and controls',wall_clock_and_controls);group('Approved green football',football)
 export('hallway-refined.glb')
