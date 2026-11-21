"""Verify preserved photographed mug pixels without publishing the private source."""
import hashlib,io,json,struct,subprocess,os
from pathlib import Path
from PIL import Image
base='563ad42dfe3fc78a98f1926ebf743f706bc5d26d'
def pixels(data):
 n=struct.unpack_from('<I',data,12)[0];doc=json.loads(data[20:20+n]);binary=data[28+n:]
 mat=next(m for m in doc['materials'] if m['name']=='IMG_9974 isolated mug artwork')
 texture=doc['textures'][mat['pbrMetallicRoughness']['baseColorTexture']['index']]
 view=doc['bufferViews'][doc['images'][texture['source']]['bufferView']];start=view.get('byteOffset',0)
 image=Image.open(io.BytesIO(binary[start:start+view['byteLength']])).convert('RGBA')
 return {'size':list(image.size),'rgba_sha256':hashlib.sha256(image.tobytes()).hexdigest()}
old=pixels(subprocess.check_output(['git','show',base+':v4/assets/models/final-room-props.glb']))
new=pixels(Path('v4/assets/models/final-room-props.glb').read_bytes());assert old==new,'Original mug pixels changed'
result={'result':'PASS','reviewedBase':base,'original':old,'refined':new,'limit':'Preserves the reviewed isolated front crop. Does not recover occluded edges or unseen mug backs.'}
out=Path(os.environ.get('HW_PROOF_DIR','v4/qa/visual-refinement'));out.mkdir(parents=True,exist_ok=True);(out/'mug-art-proof.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
