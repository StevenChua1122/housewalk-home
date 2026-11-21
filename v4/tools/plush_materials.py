"""Small deterministic microfiber maps, independent of the existing woven cloth."""
from pathlib import Path
from PIL import Image,ImageFilter
import numpy as np
out=Path(__file__).resolve().parents[1]/'assets/materials';rng=np.random.default_rng(44180);N=512
h=np.asarray(Image.fromarray(np.uint8(rng.random((N,N))*255)).filter(ImageFilter.GaussianBlur(.65)),dtype=float)/255
# Very short, randomly staggered fibers avoid woven checkerboard on plush fur.
y,x=np.mgrid[:N,:N];h=.55*h+.07*np.sin(x*.8+y*.16)+.025*np.sin(y*2.2+x*.2)
dy,dx=np.gradient(h);v=np.stack([-dx*1.4,-dy*1.4,np.ones_like(h)],2);v/=np.linalg.norm(v,axis=2)[:,:,None]
Image.fromarray(np.uint8(np.clip(v*.5+.5,0,1)*255)).save(out/'refined-plush-normal.webp',quality=94)
Image.fromarray(np.uint8(np.clip(.91+h*.06,0,1)*255)).save(out/'refined-plush-color.jpg',quality=92)
Image.fromarray(np.uint8(np.clip(.92+h*.04,0,1)*255)).save(out/'refined-plush-roughness.jpg',quality=92)
