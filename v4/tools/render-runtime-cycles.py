"""Cycles comparison of the exported connected walkthrough, never a restaged scene.
HW_OFFLINE_DIR holds export-runtime.cjs outputs; HW_CYCLES_OUTPUT stores PNGs.
Optional HW_CYCLES_VIEWS, HW_CYCLES_SCALE and HW_CYCLES_SAMPLES are QA overrides.
"""
import bpy,os,json,math,time,hashlib,subprocess,numpy as np
from pathlib import Path
from mathutils import Vector,Matrix
root=Path(__file__).resolve().parents[1]
source=Path(os.environ.get('HW_OFFLINE_DIR','/workspace/work/round4/cycles'))
out=Path(os.environ.get('HW_CYCLES_OUTPUT',str(source/'renders')));out.mkdir(parents=True,exist_ok=True)
manifest=json.loads((source/'runtime-manifest.json').read_text())
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source/'connected-runtime.glb'),export_import_convert_lighting_mode='COMPAT')
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=int(os.environ.get('HW_CYCLES_SAMPLES','128'));scene.cycles.use_adaptive_sampling=True;scene.cycles.adaptive_threshold=.04;scene.cycles.adaptive_min_samples=16
scene.cycles.use_denoising=False;scene.cycles.max_bounces=8;scene.cycles.diffuse_bounces=4;scene.cycles.glossy_bounces=4;scene.cycles.transmission_bounces=8;scene.cycles.transparent_max_bounces=16;scene.cycles.sample_clamp_indirect=10
scene.render.threads_mode='FIXED';scene.render.threads=int(os.environ.get('HW_CYCLES_THREADS','4'));scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGB';scene.render.image_settings.color_depth='8';scene.render.film_transparent=False
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium Low Contrast';scene.view_settings.exposure=float(os.environ.get('HW_CYCLES_EXPOSURE','.7'))
world=bpy.data.worlds.new('Controlled daylight — no photographs');world.use_nodes=True;scene.world=world
bg=world.node_tree.nodes.get('Background');bg.inputs['Color'].default_value=(.57,.68,.82,1);bg.inputs['Strength'].default_value=.60
# Realtime geometry-contact vertex shading is not albedo. Cycles computes contact
# and indirect paths directly. Keep all material base colors and true color art.
removed=0
for mat in bpy.data.materials:
 if not mat.use_nodes or not mat.get('housewalkGeometryAO'):continue
 for node in mat.node_tree.nodes:
  if node.type=='VERTEX_COLOR':
   for link in list(mat.node_tree.links):
    if link.from_node==node:
     # Neutralize the AO-only attribute to white without touching other colors.
     target=link.to_socket;mat.node_tree.links.remove(link);target.default_value=1.0 if isinstance(target.default_value,float) else (1,1,1,1)
   removed+=1
# True thin glass translations preserve original geometric surfaces/alpha.
# Do not turn alpha windows into opaque shadow blockers in a path tracer.
for mat in bpy.data.materials:
 if not mat.use_nodes:continue
 bs=next((n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
 if not bs:continue
 if 'Offline mirror translation' in mat.name:bs.inputs['Metallic'].default_value=1;bs.inputs['Roughness'].default_value=.005
for light in bpy.data.lights:
 if light.type=='SUN':light.angle=math.radians(.55)
 elif light.type in ['POINT','SPOT']:light.shadow_soft_size=.045
lightingMode=os.environ.get('HW_CYCLES_LIGHTING','physical-daylight');glassTranslations=[];omittedBounce=[];windowRadiance=float(os.environ.get('HW_CYCLES_WINDOW_RADIANCE','4'))
if lightingMode=='physical-daylight':
 # Realtime fill sources approximate indirect bounce. A path tracer computes
 # that bounce, so retaining these proxies would count it twice. Real lamp,
 # hood and ceiling/track fixtures keep their original positions and powers.
 proxies=[(6.08,1.85,5.65),(3.70,1.90,5.40),(1.45,1.65,2.35),(3.92,1.54,6.80),(2.22,1.65,.70),(4.10,1.65,.70)]
 for r in manifest['lights']:
  if not r.get('exportName') or not any((Vector(r['position'])-Vector(p)).length<1e-5 for p in proxies):continue
  o=bpy.data.objects[r['exportName']];omittedBounce.append({'light':r['exportName'],'sourcePosition':r['position'],'sourceIntensity':r['intensity'],'reason':'Realtime indirect-light proxy, replaced by actual path-traced bounce.'});o.data.energy=0
 for o in bpy.data.objects:
  if o.get('originalName','').replace('_',' ')!='Bathroom frosted window':continue
  for mat in o.data.materials:
   bs=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
   bs.inputs['Transmission Weight'].default_value=.80;bs.inputs['Roughness'].default_value=.35;bs.inputs['IOR'].default_value=1.45;bs.inputs['Emission Color'].default_value=(.72,.80,.86,1);bs.inputs['Emission Strength'].default_value=windowRadiance
   glassTranslations.append({'object':o.name,'translation':'Same frosted pane geometry: rough transmission plus controlled exterior daylight radiance, replacing its realtime opaque/emissive approximation.','transmission':.80,'roughness':.35,'IOR':1.45,'daylightEmissionRadiance':windowRadiance})
 for mat in bpy.data.materials:
  if not mat.use_nodes:continue
  bs=next((n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
  if not bs or abs(bs.inputs['Alpha'].default_value-.93)>.0001 or abs(bs.inputs['Roughness'].default_value-.68)>.0001:continue
  bs.inputs['Alpha'].default_value=1;bs.inputs['Metallic'].default_value=0;bs.inputs['Transmission Weight'].default_value=.80;bs.inputs['Roughness'].default_value=.35;bs.inputs['IOR'].default_value=1.45;bs.inputs['Emission Color'].default_value=(.72,.80,.86,1);bs.inputs['Emission Strength'].default_value=windowRadiance
  glassTranslations.append({'material':mat.name,'translation':'Same kitchen frosted pane geometry: rough transmission and the same controlled exterior daylight radiance.','transmission':.80,'roughness':.35,'IOR':1.45,'daylightEmissionRadiance':windowRadiance})
 if len(glassTranslations)!=2 or len(omittedBounce)!=6:raise RuntimeError('Expected two fixed frosted panes and six known realtime bounce proxies')
# Optional official Intel Open Image Denoise CLI. Auxiliary passes come from
# this exact Cycles render; only sampling noise is filtered, never object design.
oidn=os.environ.get('HW_OIDN_BIN');aux=source/'denoise-work';aux.mkdir(exist_ok=True)
if oidn:
 scene.use_nodes=True;tree=scene.node_tree;tree.nodes.clear();layers=tree.nodes.new('CompositorNodeRLayers');scene.view_layers[0].cycles.denoising_store_passes=True
 node=tree.nodes.new('CompositorNodeOutputFile');node.base_path=str(aux);node.format.file_format='OPEN_EXR';node.format.color_depth='32';node.file_slots.clear()
 for name,socket in [('beauty','Image'),('albedo','Denoising Albedo'),('normal','Denoising Normal')]:
  node.file_slots.new(name);tree.links.new(layers.outputs[socket],node.inputs[name])
 composite=tree.nodes.new('CompositorNodeComposite');tree.links.new(layers.outputs['Image'],composite.inputs['Image'])
def denoise_png(file,w,h):
 for name in ['beauty','albedo','normal']:
  im=bpy.data.images.load(str(aux/(name+'0001.exr')),check_existing=False);rgba=np.asarray(im.pixels[:],dtype=np.float32).reshape(h,w,4);rgb=np.ascontiguousarray(rgba[:,:,:3],dtype='<f4');bpy.data.images.remove(im)
  (aux/(name+'.pfm')).write_bytes(('PF\n%d %d\n-1.0\n'%(w,h)).encode()+rgb.tobytes())
 subprocess.run([oidn,'--hdr',str(aux/'beauty.pfm'),'--alb',str(aux/'albedo.pfm'),'--nrm',str(aux/'normal.pfm'),'-o',str(aux/'filtered.pfm'),'--threads','4','--quality','high'],check=True)
 with (aux/'filtered.pfm').open('rb') as f:
  assert f.readline().strip()==b'PF';ww,hh=map(int,f.readline().split());endian=float(f.readline());rgb=np.frombuffer(f.read(),dtype='<f4' if endian<0 else '>f4').reshape(hh,ww,3)
 rgba=np.ones((h,w,4),dtype=np.float32);rgba[:,:,:3]=rgb;im=bpy.data.images.new('Denoised actual Cycles result',width=w,height=h,alpha=True,float_buffer=True);im.pixels.foreach_set(rgba.ravel());im.save_render(str(file),scene=scene);bpy.data.images.remove(im)
# Verify topology and fixed transformations from the original runtime export.
records={r['name']:r for r in manifest['meshes']};proof=[];convert=Matrix(((1,0,0,0),(0,0,-1,0),(0,1,0,0),(0,0,0,1)))
for name,r in records.items():
 o=bpy.data.objects.get(name)
 if o is None:raise RuntimeError('Missing runtime object '+name)
 expected=convert@Matrix([r['matrix'][i::4] for i in range(4)])@convert.inverted()
 error=max(abs(o.matrix_world[i][j]-expected[i][j]) for i in range(4) for j in range(4))
 # Blender may bake axis conversion into local mesh coordinates; test world
 # translation plus actual triangle count, retaining full source matrices.
 o.data.calc_loop_triangles();tris=len(o.data.loop_triangles)
 expectedTris=(r['indices'] or r['vertices'])//3
 if tris!=expectedTris:raise RuntimeError(f'Topology mismatch {name}: {tris} != {expectedTris}')
 if error>1e-4:raise RuntimeError('Placement/orientation changed '+name+' error '+str(error))
 proof.append({'name':name,'triangles':tris,'matrixMaxError':error})
lightDirections=[]
for r in manifest['lights']:
 if not r.get('exportName') or not r.get('target'):continue
 o=bpy.data.objects.get(r['exportName']);expected=(convert.to_3x3()@(Vector(r['target'])-Vector(r['position']))).normalized();actual=(o.matrix_world.to_quaternion()@Vector((0,0,-1))).normalized();error=expected.angle(actual)
 if error>.001:raise RuntimeError('Light direction changed '+r['exportName'])
 lightDirections.append({'name':r['exportName'],'radianError':error})
# Original primary camera definitions are read without modifying the capture tool.
text=(root/'tests/capture-owner-final.cjs').read_text();import re
views=[]
for raw in re.findall(r"\{name:'(hallway|kitchen|bathroom-first|bathroom-shower|bathroom-closed)'([^}]+)\}",text):
 d={'name':raw[0]}
 for key,val in re.findall(r'(x|z|yaw|pitch|eye|fov|w|h):([\d.\-]+)',raw[1]):d[key]=float(val)
 d['closed']='closed:true' in raw[1];views.append(d)
selected=os.environ.get('HW_CYCLES_VIEWS','').split(',');scale=float(os.environ.get('HW_CYCLES_SCALE','1'))
if selected!=['']:views.sort(key=lambda v:selected.index(v['name']) if v['name'] in selected else len(selected))
bpy.ops.object.camera_add();camera=bpy.context.object;camera.name='Frozen walkthrough comparison camera';scene.camera=camera;camera.data.type='PERSP';camera.data.sensor_fit='VERTICAL';camera.data.sensor_height=24;camera.data.clip_start=.06;camera.data.clip_end=80
originalDoor={o.name:o.matrix_world.copy() for o in scene.objects if o.get('bathDoorMember')};pivot=Vector((manifest['bathDoor']['pivot'][0],-manifest['bathDoor']['pivot'][2],manifest['bathDoor']['pivot'][1]));doorDelta=Matrix.Translation(pivot)@Matrix.Rotation(manifest['bathDoor']['closed']-manifest['bathDoor']['open'],4,'Z')@Matrix.Translation(-pivot)
report={'sourceGLBSha256':hashlib.sha256((source/'connected-runtime.glb').read_bytes()).hexdigest(),'recipeSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'sourceRevision':manifest['revision'],'geometryTriangles':sum(r['triangles'] for r in proof),'lightDirectionsVerified':lightDirections,'objectsVerified':len(proof),'maxMatrixError':max(p['matrixMaxError'] for p in proof),'geometry':'Same runtime meshes, object transformations and camera poses. No restaging, mockup background, wall/fixture/furniture movement. PBR renderer translations are explicit below.','translation':{'renderer':'Cycles CPU, real multi-bounce indirect illumination','lightingMode':lightingMode,'lights':'glTF COMPAT: sun intensity retained; point/spot numerical intensity × 4π watts is a renderer compatibility translation, not a photometric survey. Real fixture positions/powers retained.','omittedRealtimeBounceProxies':omittedBounce,'glass':glassTranslations,'world':'Uniform blue daylight radiance 0.60, no HDR photograph','toneMap':f'AgX Medium Low Contrast, {scene.view_settings.exposure:+.2f} EV; WebGL uses ACES at 0.95','contactAO':'AO-only vertex multipliers neutralized, real path-traced contact; base/color-art retained','AOAttributesNeutralized':removed,'mirror':'Reflector translated to physical mirror on same plane'},'denoising':'Official Intel OIDN 2.3.3 CPU, using actual render albedo/normal passes' if oidn else 'none','maxSamples':scene.cycles.samples,'adaptiveThreshold':scene.cycles.adaptive_threshold,'adaptiveMinimum':scene.cycles.adaptive_min_samples,'renders':[]}
(out/'cycles-proof.json').write_text(json.dumps(report,indent=2))
for v in views:
 if (source/'render-threads.txt').exists():scene.render.threads=int((source/'render-threads.txt').read_text().strip())
 if selected!=[''] and v['name'] not in selected:continue
 for name,m in originalDoor.items():bpy.data.objects[name].matrix_world=doorDelta@m if v['closed'] else m
 camera.location=(v['x'],-v['z'],v['eye']);direction=Vector((math.sin(v['yaw'])*math.cos(v['pitch']),math.cos(v['yaw'])*math.cos(v['pitch']),math.sin(v['pitch'])));camera.rotation_euler=direction.to_track_quat('-Z','Y').to_euler();camera.data.lens=12/math.tan(math.radians(v['fov'])/2)
 scene.render.resolution_x=round(v['w']*scale);scene.render.resolution_y=round(v['h']*scale);scene.render.resolution_percentage=100;scene.render.filepath=str(out/('cycles-'+v['name']+'.png'));bpy.context.view_layer.update()
 started=time.time();bpy.ops.render.render(write_still=True);
 if oidn:denoise_png(scene.render.filepath,scene.render.resolution_x,scene.render.resolution_y)
 report['renders'].append({'view':v,'width':scene.render.resolution_x,'height':scene.render.resolution_y,'threads':scene.render.threads,'seconds':round(time.time()-started,2),'file':Path(scene.render.filepath).name});(out/'cycles-proof.json').write_text(json.dumps(report,indent=2))
 print('CYCLES_CAPTURE',v['name'],report['renders'][-1]['seconds'],flush=True)
if os.environ.get('HW_SAVE_BLEND'):bpy.ops.wm.save_as_mainfile(filepath=str(source/'connected-runtime-cycles.blend'))
