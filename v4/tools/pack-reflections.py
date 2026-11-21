"""Lossless PNG container for RGBE-quantized actual 3D specular lighting bakes."""
from pathlib import Path
import json,numpy as np
from PIL import Image
out=Path(__file__).resolve().parents[1]/'assets/reflections';meta=json.loads((out/'probe-bake.json').read_text())
for m in meta['maps']:
 stem=m['state']+'-'+m['room'];half=out/(stem+'.half');v=np.frombuffer(half.read_bytes(),dtype='<f2').astype(np.float32).reshape((m['height'],m['width'],4))[:,:,:3];v=np.nan_to_num(v,nan=0,posinf=65000,neginf=0);peak=v.max(axis=2);exponent=np.ceil(np.log2(np.maximum(peak,1e-30)));scale=255/np.exp2(exponent);rgba=np.zeros((m['height'],m['width'],4),dtype=np.uint8);rgba[:,:,:3]=np.uint8(np.clip(np.rint(v*scale[:,:,None]),0,255));rgba[:,:,3]=np.where(peak>1e-30,np.clip(exponent+128,1,255),0).astype(np.uint8);m['file']=stem+'.png';Image.fromarray(np.concatenate([rgba[:,:,k] for k in range(4)],axis=0)).save(out/m['file'],optimize=True);half.unlink()
meta['encoding']='RGBE channels stored as four stacked grayscale PNG bands (opaque, no alpha conversion); rows remain in WebGL render-target order. Quantization <= 1/255 of each texel exponent range.'
(out/'probes.json').write_text(json.dumps(meta,indent=2));(out/'probe-bake.json').unlink()
