"""Targeted material-map refinement from the authored PR #5 oak, never a home photo.
Colour/height/roughness remain independent; generation is reproducible from git.
"""
from PIL import Image,ImageFilter
from pathlib import Path
from io import BytesIO
import subprocess,numpy as np
out=Path(__file__).resolve().parents[1]/'assets/materials'
original=subprocess.check_output(['git','show','c5ac96dd18db682ee11b9503964f7b61b3b54617:v4/assets/materials/oak-albedo.jpg'])
im=Image.open(BytesIO(original)).convert('RGB');a=np.asarray(im,dtype=float)
mid=np.asarray(im.filter(ImageFilter.GaussianBlur(.85)),dtype=float)
# Retain long grain, suppress harsh high-frequency fibres, and remove the yellow cast.
target=np.array([214.,190.,165.]);colour=target+(mid-mid.mean((0,1)))*.94+(a-mid)*.32
Image.fromarray(np.uint8(np.clip(colour,0,255))).save(out/'oak-albedo.jpg',quality=95,subsampling=0)
height=mid.mean(2)/255;dy,dx=np.gradient(height)
n=np.stack([-dx*.9,-dy*.9,np.ones_like(dx)],2);n/=np.sqrt((n*n).sum(2))[:,:,None]
Image.fromarray(np.uint8((n*.5+.5)*255)).save(out/'oak-normal.webp',quality=95,method=6)
r=np.clip(.63+(height-height.mean())*.14,.57,.72)
Image.fromarray(np.uint8(r*255)).save(out/'oak-roughness.jpg',quality=92)
# Restrained upholstery weave; cabinet maps and entrance-door finish stay untouched.
old=Image.open(BytesIO(subprocess.check_output(['git','show','a96da346e86e55db764dc2a2769c5e847b28e45b:v4/assets/materials/fabric-color.jpg']))).convert('L');v=np.asarray(old,dtype=float)
Image.fromarray(np.uint8(np.clip(204+(v-204)*.36,0,255))).save(out/'fabric-color.jpg',quality=94)
# Very subtle mineral surface and corresponding microscopic normal detail.
rng=np.random.default_rng(5138);N=1024;field=np.zeros((N,N))
for size,amp in [(12,.34),(42,.25),(160,.17),(512,.08)]:
 noise=rng.random((size,size));small=Image.fromarray(np.uint8(noise*255))
 field+=np.asarray(small.resize((N,N),Image.Resampling.BICUBIC),dtype=float)/255*amp
field-=field.mean();albedo=np.clip(.95+field*.065,0,1)
Image.fromarray(np.uint8(albedo*255)).save(out/'plaster-color.jpg',quality=94)
dy,dx=np.gradient(field);n=np.stack([-dx*.9,-dy*.9,np.ones_like(dx)],2);n/=np.sqrt((n*n).sum(2))[:,:,None]
Image.fromarray(np.uint8((n*.5+.5)*255)).save(out/'plaster-normal.webp',quality=94,method=6)
print('Refined oak maps, subtle textile and mineral support maps')
