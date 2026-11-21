"""Tailored sofa and drapes within the existing source asset transforms."""
import bpy,sys,math,os
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from refinement_common import *
sofa=material('Refined sofa grey woven textile','#77746c',.94)
piping=material('Refined sofa piping textile','#68665f',.94)
feet=material('Dark timber sofa feet','#42372d',.58)
def soft(name,p,s,m,r,sub=1):
 o=box(name,p,s,m,r);q=o.modifiers.new('Tailored upholstery smoothing','SUBSURF');q.levels=sub;q.render_levels=sub
 return o
def contour(name,p,w,h,r,m,vertical=False):
 pts=[]
 for cx,cy,a in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
  for k in range(12):
   t=math.radians(a+k*90/11);u=cx+r*math.cos(t);v=cy+r*math.sin(t)
   pts.append((p[0],p[1]+v,p[2]+u) if vertical else (p[0]+u,p[1],p[2]+v))
 pts.append(pts[0]);cord(name,pts,.0014,m)
def sofa_model():
 # Same untransformed bounds; runtime retains the .94 × .90 placement transform.
 soft('Continuous tailored sofa base',(.535,.205,2.39),(.93,.25,2.19),sofa,.035,1)
 soft('Sofa structural upholstered back',(.16,.58,2.39),(.20,.64,2.20),sofa,.045,1)
 for z in [1.30,3.48]:
  soft('Sofa grounded squared arm',(.535,.46,z),(.96,.45,.18),sofa,.045,1)
  cord('Arm top upholstery seam',[(.12,.683,z),(.36,.690,z),(.70,.690,z),(.98,.675,z)],.0018,piping)
 for i,z in enumerate([1.69,2.37,3.05]):
  # Mildly crowned seat, depressions at the rear and front eased edge.
  seat=soft('Tailored seat cushion '+str(i+1),(.60,.405,z),(.75,.15,.65),sofa,.040,2)
  tex=bpy.data.textures.new('Fine compressed seat cloth '+str(i+1),type='CLOUDS');tex.noise_scale=.14;tex.noise_depth=1
  dis=seat.modifiers.new('Subtle irregular fabric compression','DISPLACE');dis.texture=tex;dis.strength=.003;dis.mid_level=.5;dis.texture_coords='GLOBAL'
  # Sculpt contact and small tension folds in the existing cushion surface.
  bpy.context.view_layer.objects.active=seat
  for md in list(seat.modifiers):bpy.ops.object.modifier_apply(modifier=md.name)
  inv=seat.matrix_world.inverted()
  for vertex in seat.data.vertices:
   p=seat.matrix_world@vertex.co;weight=max(0,min(1,(p.z-.415)/.050))
   # The red doll's lower legs contact this raised, compressed patch; the
   # unloaded ring settles around it instead of letting the toy float.
   contact=math.exp(-((p.x-.60)/.12)**2-(((-p.y)-1.76)/.14)**2)
   edge=math.exp(-((p.x-.90)/.07)**2)
   p.z+=weight*(.0035*contact+.0012*edge*math.sin((-p.y)*56+p.x*13))
   vertex.co=inv@p
  contour('Seat attached piping',(.60,.466,z),.715,.615,.045,piping)
  back=soft('Soft backrest cushion '+str(i+1),(.285,.68,z),(.245,.54,.65),sofa,.065,2)
  dis=back.modifiers.new('Softly settled backrest cloth','DISPLACE');dis.texture=tex;dis.strength=.004;dis.mid_level=.5;dis.texture_coords='GLOBAL'
  bpy.context.view_layer.objects.active=back
  for md in list(back.modifiers):bpy.ops.object.modifier_apply(modifier=md.name)
  inv=back.matrix_world.inverted()
  for vertex in back.data.vertices:
   p=back.matrix_world@vertex.co;weight=max(0,min(1,(p.z-.855)/.095));zz=-p.y
   pressure=max(math.exp(-((p.x-.245)/.085)**2-((zz-(toy-.12)/.90)/.11)**2) for toy in [1.45,1.70,1.88,2.09,2.37])
   p.z-=.030*weight*pressure;vertex.co=inv@p
  # Keep seams in the same coordinate frame as the cushion; no detached rods.
  contour('Backrest attached perimeter piping',(.408,.68,z),.605,.490,.060,piping,True)
 for x in [.15,.90]:
  for z in [1.38,3.39]:softbox('Dark timber contacting sofa foot',(x,.0815,z),(.070,.133,.070),feet,.007)
 # The current locked plush/daisy arrangement replaces the superseded orange
 # scatter cushions. No furniture anchor or sofa orientation is changed.
if os.environ.get('HW_SOFT_ONLY')!='curtains':
 group('Reference tailored three-seat sofa',sofa_model);export('sofa-refined.glb');clear()

def curtains():
 # Same anchoring and tied width envelope; soft asymmetric folds carry thickness.
 for side in [-1,1]:
  U,V=96,80;v=[];uv=[];f=[];outer=1.34 if side==-1 else 3.12
  for j in range(V+1):
   t=j/V;y=.025+2.61*t
   gather=math.exp(-((t-.31)/.18)**2)
   # Locked 01: top parting is about 27% of the anchored drape span.
   # The former 16% gap blocked too much of the real window light.
   width=.35+.30*t**1.7-.15*gather
   for i in range(U+1):
    u=i/U;warp=u+.14*u*(1-u)*math.sin(u*9+.65*side)
    phase=warp*math.tau*7.5+.28*math.sin(t*2.1+u*5+side)+.12*math.sin(t*6+u*11)
    amp=(.034+.016*t)*(1+.20*math.sin(u*13+side))*(1-.70*gather)
    # Smooth deep folds, not saw-tooth/cardboard ridges. A slight under-fold
    # gives the tieback volume without inflating the entire drape.
    fold=amp*(math.sin(phase)+.14*math.sin(2*phase))
    x=outer+(-side)*width*u
    z=.965+fold+.040*math.sin(t*math.pi)*(1-t)+.008*math.sin(u*9+t*4)
    yy=y-.045*math.sin(u*math.pi)*math.sin(t*math.pi)*(1-.7*gather)
    yy+=.005*math.sin(phase)*(1-t)**7
    v.append((x,yy,z));uv.append((u*1.8,t*5.2))
  for j in range(V):
   for i in range(U):a=j*(U+1)+i;f.append((a,a+U+1,a+U+2,a+1) if side==1 else (a,a+1,a+U+2,a+U+1))
  o=mesh('Left volumetric tied drape' if side==-1 else 'Right volumetric tied drape',v,f,taupe,uv)
  s=o.modifiers.new('Blackout lining thickness','SOLIDIFY');s.thickness=.0024;s.offset=0
  for row in [0,V]:cord('Curtain folded sewn hem',[v[row*(U+1)+i] for i in range(U+1)],.0025,taupe)
  for column in [0,U]:cord('Curtain vertical sewn hem',[v[j*(U+1)+column] for j in range(V+1)],.0015,taupe)
  # Wide fabric tieback is a small ribbon with a modeled rear return.
  t=(.80-.025)/2.61;w=.35+.30*t**1.7-.15*math.exp(-((t-.31)/.18)**2);vv=[];ff=[]
  for j in range(2):
   for i in range(33):
    u=i/32;vv.append((outer+(-side)*w*u,.783+j*.032-.018*math.sin(u*math.pi),1.018+.023*math.sin(u*math.pi)))
  for i in range(32):ff.append((i,i+1,i+34,i+33))
  tie=mesh('Soft curtain tieback ribbon',vv,ff,taupe);s=tie.modifiers.new('Tieback ribbon thickness','SOLIDIFY');s.thickness=.002
if os.environ.get('HW_SOFT_ONLY')!='sofa':
 group('Refined living taupe drapes',curtains);export('curtains-refined.glb')
