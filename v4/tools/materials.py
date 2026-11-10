"""Build authored PBR support maps. No private reference image is used as a texture."""
from PIL import Image,ImageFilter
import numpy as np
from pathlib import Path
import sys
out=Path(__file__).resolve().parents[1]/'assets/materials';out.mkdir(exist_ok=True,parents=True)
if len(sys.argv)>1:
 im=Image.open(sys.argv[1]).convert('RGB').resize((2048,2048),Image.Resampling.LANCZOS)
 im.save(out/'oak-albedo.jpg',quality=95,subsampling=0)
else: im=Image.open(out/'oak-albedo.jpg')
a=np.asarray(im).astype(float)/255
lum=a.mean(2);fine=lum-np.asarray(im.filter(ImageFilter.GaussianBlur(3))).mean(2)/255
# Microscopic fibers, not deep carved wood; physical strength is set independently in PBR.
dy,dx=np.gradient(fine);nx=-dx*1.9;ny=-dy*1.9;nz=np.ones_like(nx);norm=np.sqrt(nx*nx+ny*ny+nz*nz)
normal=np.stack([nx/norm,ny/norm,nz/norm],2)
Image.fromarray(np.uint8(np.clip(normal*.5+.5,0,1)*255)).save(out/'oak-normal.png')
rough=np.clip(.68+(lum-lum.mean())*.12+fine*.3,.57,.78)
Image.fromarray(np.uint8(rough*255)).save(out/'oak-roughness.jpg',quality=92)
rng=np.random.default_rng(429);N=1024;y,x=np.mgrid[0:N,0:N]
# Real warp/weft support maps: low contrast albedo, restrained normal strength in engine.
fiber=(np.sin(x*np.pi/2)*np.sin(y*np.pi/2)*.28+np.sin(x*np.pi/4)*.20+np.sin(y*np.pi/4)*.20+rng.normal(0,.11,(N,N)))
fabric=np.clip(.80+fiber*.07,0,1)
Image.fromarray(np.uint8(fabric*255)).save(out/'fabric-color.jpg',quality=94)
dy,dx=np.gradient(fiber);normal=np.stack([-dx*.16,-dy*.16,np.ones_like(dx)],2);normal/=np.sqrt((normal**2).sum(2))[:,:,None]
Image.fromarray(np.uint8((normal*.5+.5)*255)).save(out/'fabric-normal.png')
# Cabinet fronts: fine cross-grain texture at a much larger scale than upholstery.
low=rng.normal(0,1,(256,256)); low=np.asarray(Image.fromarray(np.uint8((low-low.min())/(low.max()-low.min())*255)).resize((N,N))).astype(float)/255
cab=np.clip(.72+fiber*.035+(low-.5)*.10,0,1)
Image.fromarray(np.uint8(cab*255)).save(out/'cabinet-weave.jpg',quality=94)

for name in ['oak-normal','fabric-normal']:
 Image.open(out/(name+'.png')).save(out/(name+'.webp'),quality=95,method=6)
 (out/(name+'.png')).unlink()

# Pale ash entrance leaf, generated from the authored oak grain rather than a home photo.
neutral=np.clip((lum-lum.mean())*.42+.753,0,1)
ash=np.stack([neutral*1.047,neutral,neutral*.922],2)
Image.fromarray(np.uint8(np.clip(ash,0,1)*255)).save(out/'door-ash.jpg',quality=94)
