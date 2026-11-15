"""Independent procedural PBR support maps; no source room/reference pixels."""
from pathlib import Path
from PIL import Image,ImageFilter
import numpy as np
out=Path(__file__).resolve().parents[1]/'assets/materials';rng=np.random.default_rng(8115);N=1024
def noise(size):return np.asarray(Image.fromarray(np.uint8(rng.random((size,size))*255)).resize((N,N),Image.Resampling.BICUBIC),dtype=float)/255-.5
def normal(name,h,strength):
 dy,dx=np.gradient(h);v=np.stack([-dx*strength,-dy*strength,np.ones_like(h)],2);v/=np.linalg.norm(v,axis=2)[:,:,None];Image.fromarray(np.uint8(np.clip(v*.5+.5,0,1)*255)).save(out/(name+'-normal.webp'),quality=94,method=6)
def gray(name,v):Image.fromarray(np.uint8(np.clip(v,0,1)*255)).save(out/name,quality=94)
y,x=np.mgrid[0:N,0:N]
weave=(np.sin(x*np.pi/2)*.30+np.sin(y*np.pi/2)*.30+np.sin((x+y)*np.pi/2)*.09)+noise(256)*.13
normal('refined-weave',weave,1.1);gray('refined-weave-color.jpg',.93+noise(128)*.035+weave*.022);gray('refined-weave-roughness.jpg',.88+weave*.04)
linen=np.repeat(rng.normal(0,.12,(1,N)),N,axis=0)+np.repeat(rng.normal(0,.12,(N,1)),N,axis=1)+noise(32)*.22+noise(256)*.05
normal('refined-cabinet',linen,.8);gray('refined-cabinet-color.jpg',.95+linen*.025);gray('refined-cabinet-roughness.jpg',.70+linen*.05)
stone=noise(18)*.35+noise(96)*.22+noise(512)*.11
normal('refined-stone',stone,.65);gray('refined-stone-color.jpg',.94+stone*.13);gray('refined-stone-roughness.jpg',.68+stone*.14)
tile=noise(12)*.28+noise(64)*.17+noise(256)*.10+noise(768)*.035
normal('refined-tile',tile,.8);gray('refined-tile-color.jpg',.96+tile*.08);gray('refined-tile-roughness.jpg',.80+tile*.08)
steel=np.repeat(rng.normal(0,.12,(N,1)),N,axis=1)+noise(512)*.02
normal('refined-steel',steel,.8);gray('refined-steel-roughness.jpg',.75+steel*.22)
print('Authored textile, cabinet, stone, tile and brushed-metal PBR maps')
